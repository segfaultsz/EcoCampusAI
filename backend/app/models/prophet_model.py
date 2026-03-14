"""
EcoCampus AI - Prophet Energy Forecasting Model
=================================================
Uses Facebook Prophet for time-series energy consumption forecasting.
Trains per-building models with daily + weekly seasonality, exam periods,
and seasonal effects. Predicts next 7 days with confidence intervals.
"""

import os
import sys
import json
import joblib
import warnings
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

warnings.filterwarnings("ignore")

# Prophet import (optional — falls back to simple model if unavailable)
try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    HAS_PROPHET = False
    print("WARNING: Prophet not installed. Using fallback statistical model.")


class EnergyForecaster:
    """Forecasts energy consumption per building using Prophet or fallback."""

    def __init__(self, model_dir: str = "./trained_models"):
        self.model_dir = model_dir
        self.models = {}  # building_id -> trained model
        self.stats = {}   # building_id -> training stats (for fallback)
        os.makedirs(model_dir, exist_ok=True)

    def _prepare_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert energy data to Prophet format (ds, y)."""
        # Aggregate hourly to daily for more stable predictions
        df = df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        daily = df.groupby(df["timestamp"].dt.date).agg(
            y=("consumption_kwh", "sum")
        ).reset_index()
        daily.columns = ["ds", "y"]
        daily["ds"] = pd.to_datetime(daily["ds"])

        # Add custom features
        daily["is_weekend"] = daily["ds"].dt.dayofweek >= 5
        daily["month"] = daily["ds"].dt.month
        daily["day_of_week"] = daily["ds"].dt.dayofweek

        return daily

    def train(self, building_id: str, energy_data: pd.DataFrame) -> dict:
        """
        Train a forecasting model for a specific building.
        Returns training metrics.
        """
        df = self._prepare_data(energy_data)

        if len(df) < 14:
            return {"error": "Not enough data (need at least 14 days)"}

        # Store stats for fallback model
        self.stats[building_id] = {
            "mean": float(df["y"].mean()),
            "std": float(df["y"].std()),
            "weekday_mean": float(df[~df["is_weekend"]]["y"].mean()),
            "weekend_mean": float(df[df["is_weekend"]]["y"].mean()),
            "monthly_means": df.groupby("month")["y"].mean().to_dict(),
            "dow_means": df.groupby("day_of_week")["y"].mean().to_dict(),
        }

        if HAS_PROPHET:
            return self._train_prophet(building_id, df)
        else:
            return self._train_fallback(building_id, df)

    def _train_prophet(self, building_id: str, df: pd.DataFrame) -> dict:
        """Train Prophet model with custom seasonality."""
        prophet_df = df[["ds", "y"]].copy()

        model = Prophet(
            yearly_seasonality=False,  # Only 6 months of data
            weekly_seasonality=True,
            daily_seasonality=False,   # We use daily aggregated data
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10,
            interval_width=0.90,
        )

        # Add monthly seasonality
        model.add_seasonality(
            name="monthly",
            period=30.5,
            fourier_order=5,
        )

        # Add weekend regressor
        prophet_df["is_weekend"] = (prophet_df["ds"].dt.dayofweek >= 5).astype(float)
        model.add_regressor("is_weekend")

        model.fit(prophet_df)

        # Calculate accuracy on last 7 days
        train_df = prophet_df[:-7]
        test_df = prophet_df[-7:]

        future_test = model.make_future_dataframe(periods=0)
        future_test = future_test.merge(
            prophet_df[["ds", "is_weekend"]], on="ds", how="left"
        )
        forecast = model.predict(future_test)

        # Match on test period
        test_forecast = forecast[forecast["ds"].isin(test_df["ds"])]
        if len(test_forecast) > 0 and len(test_df) > 0:
            actual = test_df["y"].values
            predicted = test_forecast["yhat"].values[:len(actual)]
            mape = float(np.mean(np.abs((actual - predicted) / actual)) * 100)
            r2 = float(1 - np.sum((actual - predicted) ** 2) / np.sum((actual - np.mean(actual)) ** 2))
        else:
            mape, r2 = 0.0, 0.0

        # Save model
        model_path = os.path.join(self.model_dir, f"prophet_{building_id}.pkl")
        joblib.dump(model, model_path)
        self.models[building_id] = model

        return {
            "building_id": building_id,
            "model_type": "prophet",
            "mape": round(mape, 2),
            "r2": round(max(r2, 0), 4),
            "training_samples": len(prophet_df),
            "model_path": model_path,
        }

    def _train_fallback(self, building_id: str, df: pd.DataFrame) -> dict:
        """Simple statistical fallback when Prophet is unavailable."""
        stats = self.stats[building_id]

        # Calculate MAPE on last 7 days using DOW means
        test = df[-7:]
        predictions = [stats["dow_means"].get(row["day_of_week"], stats["mean"]) for _, row in test.iterrows()]
        actual = test["y"].values
        mape = float(np.mean(np.abs((actual - predictions) / actual)) * 100)

        # Save stats as "model"
        model_path = os.path.join(self.model_dir, f"stats_{building_id}.json")
        with open(model_path, "w") as f:
            json.dump(stats, f)

        return {
            "building_id": building_id,
            "model_type": "statistical_fallback",
            "mape": round(mape, 2),
            "r2": round(max(1 - (mape / 100), 0), 4),
            "training_samples": len(df),
            "model_path": model_path,
        }

    def predict(self, building_id: str, days: int = 7) -> dict:
        """
        Predict energy consumption for next N days.
        Returns daily predictions with confidence intervals.
        """
        if HAS_PROPHET and building_id in self.models:
            return self._predict_prophet(building_id, days)
        elif building_id in self.stats:
            return self._predict_fallback(building_id, days)
        else:
            # Try loading saved model
            return self._predict_from_saved(building_id, days)

    def _predict_prophet(self, building_id: str, days: int) -> dict:
        """Predict using trained Prophet model."""
        model = self.models[building_id]
        future = model.make_future_dataframe(periods=days)
        future["is_weekend"] = (future["ds"].dt.dayofweek >= 5).astype(float)
        forecast = model.predict(future)

        # Get only future predictions
        predictions = forecast.tail(days)

        results = []
        for _, row in predictions.iterrows():
            is_peak = row["yhat"] > forecast["yhat"].quantile(0.85)
            results.append({
                "date": row["ds"].strftime("%Y-%m-%d"),
                "predicted_kwh": round(float(row["yhat"]), 2),
                "confidence_lower": round(float(row["yhat_lower"]), 2),
                "confidence_upper": round(float(row["yhat_upper"]), 2),
                "is_peak_predicted": bool(is_peak),
                "day_of_week": row["ds"].strftime("%A"),
            })

        return {
            "building_id": building_id,
            "model_type": "prophet",
            "predictions": results,
        }

    def _predict_fallback(self, building_id: str, days: int) -> dict:
        """Predict using statistical fallback."""
        stats = self.stats[building_id]
        today = datetime.now()
        results = []

        for i in range(1, days + 1):
            date = today + timedelta(days=i)
            dow = date.weekday()
            base = stats["dow_means"].get(dow, stats["mean"])

            # Add monthly seasonality
            month = date.month
            monthly_factor = stats["monthly_means"].get(month, stats["mean"]) / stats["mean"]
            predicted = base * monthly_factor

            # Confidence interval (±15%)
            margin = predicted * 0.15
            is_peak = predicted > stats["mean"] * 1.15

            results.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_kwh": round(predicted, 2),
                "confidence_lower": round(predicted - margin, 2),
                "confidence_upper": round(predicted + margin, 2),
                "is_peak_predicted": bool(is_peak),
                "day_of_week": date.strftime("%A"),
            })

        return {
            "building_id": building_id,
            "model_type": "statistical_fallback",
            "predictions": results,
        }

    def _predict_from_saved(self, building_id: str, days: int) -> dict:
        """Try to load a saved model and predict."""
        # Try Prophet model first
        prophet_path = os.path.join(self.model_dir, f"prophet_{building_id}.pkl")
        if os.path.exists(prophet_path) and HAS_PROPHET:
            self.models[building_id] = joblib.load(prophet_path)
            return self._predict_prophet(building_id, days)

        # Try stats model
        stats_path = os.path.join(self.model_dir, f"stats_{building_id}.json")
        if os.path.exists(stats_path):
            with open(stats_path) as f:
                self.stats[building_id] = json.load(f)
            return self._predict_fallback(building_id, days)

        return {"error": f"No trained model found for building {building_id}"}

    def load_all_models(self):
        """Load all saved models from disk."""
        for fname in os.listdir(self.model_dir):
            if fname.startswith("prophet_") and fname.endswith(".pkl") and HAS_PROPHET:
                bid = fname.replace("prophet_", "").replace(".pkl", "")
                self.models[bid] = joblib.load(os.path.join(self.model_dir, fname))
            elif fname.startswith("stats_") and fname.endswith(".json"):
                bid = fname.replace("stats_", "").replace(".json", "")
                with open(os.path.join(self.model_dir, fname)) as f:
                    self.stats[bid] = json.load(f)

# ── Real weather regressors (satellite + Open-Meteo archive) ──────────────

def train_with_weather(energy_df, weather_df):
    """
    Train Prophet with 4 real weather regressors from Open-Meteo / satellite data.

    Args:
        energy_df:  DataFrame columns [ds, y]
                    ds = datetime (hourly), y = kWh
        weather_df: DataFrame columns [ds, temp_c, radiation_wm2, cloud_pct, humidity_pct]
                    from real_data_service.fetch_historical_weather() output

    Returns: fitted Prophet model with weather regressors

    USAGE:
        from services.real_data_service import fetch_historical_weather
        import asyncio
        weather_raw = asyncio.run(fetch_historical_weather("2025-09-01", "2026-03-14"))
        weather_df  = pd.DataFrame(weather_raw).rename(
            columns={"shortwave_radiation_wm2": "radiation_wm2"}
        )
        weather_df["ds"] = pd.to_datetime(weather_df["time"]).dt.tz_localize(None)
        model = train_with_weather(energy_df, weather_df)
    """
    import pandas as pd
    from prophet import Prophet

    df = energy_df.merge(weather_df[["ds", "temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]],
                         on="ds", how="left")
    for col in ["temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]:
        df[col] = df[col].fillna(df[col].median())

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=True,
        changepoint_prior_scale=0.05,
        interval_width=0.9
    )
    model.add_regressor("temp_c",        standardize=True)
    model.add_regressor("radiation_wm2", standardize=True)
    model.add_regressor("cloud_pct",     standardize=True)
    model.add_regressor("humidity_pct",  standardize=True)
    model.fit(df)
    return model


def predict_with_weather(model, future_df, weather_df):
    """
    Generate forecast using a weather-enhanced Prophet model.

    Args:
        model:      fitted Prophet model from train_with_weather()
        future_df:  DataFrame with column [ds] — future timestamps to predict
        weather_df: DataFrame with [ds, temp_c, radiation_wm2, cloud_pct, humidity_pct]
                    Must cover all ds values in future_df

    Returns: Prophet forecast DataFrame with yhat, yhat_lower, yhat_upper
    """
    import pandas as pd

    future_df = future_df.merge(
        weather_df[["ds", "temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]],
        on="ds", how="left"
    )
    for col in ["temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]:
        future_df[col] = future_df[col].fillna(0.0)
    return model.predict(future_df)


def load_trained_model(path: str = None):
    """
    Load the pre-trained model bundle saved by backend/data/train_model.py.

    Returns dict with keys: model, metrics, co2_kg_per_kwh, trained_on, regressors
    Returns None if file not found (fall back to on-demand training).
    """
    import pickle
    from pathlib import Path

    if path is None:
        path = Path(__file__).parent.parent.parent / "trained_models" / "prophet_with_weather.pkl"

    try:
        with open(path, "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        return None
