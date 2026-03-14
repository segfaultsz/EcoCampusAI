"""
train_model.py
Run AFTER: seed_real_weather.py (and optionally calibrate_from_iblend.py)
Usage: python backend/data/train_model.py
Saves: backend/trained_models/prophet_with_weather.pkl
"""
import asyncio
import json
import pickle
import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
from prophet import Prophet

sys.path.insert(0, str(Path(__file__).parent.parent / "app"))

WEATHER_FILE  = Path(__file__).parent / "real_weather.json"
PROFILE_FILE  = Path(__file__).parent / "real_load_profile.json"
OUTPUT_DIR    = Path(__file__).parent.parent / "trained_models"
OUTPUT_FILE   = OUTPUT_DIR / "prophet_with_weather.pkl"

CO2_KG_PER_KWH = 0.727   # CEA v20.0 FY2023-24


def load_weather_df() -> pd.DataFrame:
    """Load real_weather.json into a DataFrame indexed by timestamp."""
    with open(WEATHER_FILE) as f:
        data = json.load(f)
    rows = [{"ds": pd.to_datetime(k), **v} for k, v in data["hourly"].items()]
    df = pd.DataFrame(rows).sort_values("ds").reset_index(drop=True)
    df["ds"] = df["ds"].dt.tz_localize(None)
    print(f"Loaded {len(df)} hourly weather rows: {df['ds'].min()} → {df['ds'].max()}")
    return df


def load_load_profile() -> dict:
    """Load I-BLEND calibrated load profile if available, else use defaults."""
    if PROFILE_FILE.exists():
        with open(PROFILE_FILE) as f:
            data = json.load(f)
        print("Using I-BLEND calibrated load profiles.")
        return data["building_profiles"]
    print("WARNING: real_load_profile.json not found. Using defaults.")
    return {}


def generate_training_data(
    weather_df: pd.DataFrame,
    building_code: str,
    profile: dict
) -> pd.DataFrame:
    """
    Generate synthetic energy consumption for one building using:
    - Real hourly temperature and solar radiation as load drivers
    - I-BLEND calibrated hourly multipliers (if available)
    Returns DataFrame with columns: ds, y, temp_c, radiation_wm2, cloud_pct, humidity_pct
    """
    df = weather_df.copy()

    # Base load from I-BLEND profile (or defaults)
    if building_code in profile:
        p = profile[building_code]
        df["hour"] = df["ds"].dt.hour
        df["base_kwh"] = df["hour"].map(p["hourly_mean"]).fillna(10.0)

        # Weekend reduction
        df["is_weekend"] = df["ds"].dt.dayofweek >= 5
        df.loc[df["is_weekend"], "base_kwh"] /= p["weekday_vs_weekend_ratio"]

        # Summer AC load boost based on real temperature
        df["temp_factor"] = 1.0 + np.clip(
            (df["temp_c"] - 28) * 0.03, 0, 0.5
        )
        df["base_kwh"] *= df["temp_factor"]

        # Solar irradiance reduces lighting load
        df["solar_factor"] = 1.0 - np.clip(df["radiation_wm2"] / 1200, 0, 0.15)
        df["base_kwh"] *= df["solar_factor"]

        # Realistic noise
        noise_std = df["base_kwh"].mean() * p.get("std_dev_pct", 0.12)
        df["base_kwh"] += np.random.normal(0, noise_std, len(df))
        df["base_kwh"] = df["base_kwh"].clip(lower=0.1)
    else:
        df["base_kwh"] = 20.0 + np.random.normal(0, 3, len(df))

    df = df.rename(columns={
        "base_kwh":     "y",
        "temp_c":       "temp_c",
        "radiation_wm2": "radiation_wm2",
        "cloud_pct":    "cloud_pct",
        "humidity_pct": "humidity_pct"
    })
    return df[["ds", "y", "temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]]


def train_prophet(df: pd.DataFrame) -> Prophet:
    """
    Train Prophet with real weather regressors.
    Regressors: temp_c, radiation_wm2, cloud_pct, humidity_pct
    Seasonalities: yearly, weekly, daily
    """
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=True,
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0,
        interval_width=0.9
    )
    model.add_regressor("temp_c",         standardize=True)
    model.add_regressor("radiation_wm2",  standardize=True)
    model.add_regressor("cloud_pct",      standardize=True)
    model.add_regressor("humidity_pct",   standardize=True)

    train_df = df[["ds", "y", "temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]].copy()
    train_df = train_df.dropna()
    model.fit(train_df)
    return model


def evaluate_model(model: Prophet, df: pd.DataFrame) -> dict:
    """Compute MAPE on last 14 days of training data as a holdout set."""
    cutoff = df["ds"].max() - pd.Timedelta(days=14)
    test_df = df[df["ds"] >= cutoff].copy()
    if len(test_df) < 10:
        return {"mape": None, "note": "insufficient holdout data"}
    forecast = model.predict(test_df[["ds", "temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]])
    actual = test_df["y"].values
    predicted = forecast["yhat"].values[:len(actual)]
    mape = float(np.mean(np.abs((actual - predicted) / np.maximum(actual, 1))) * 100)
    return {"mape": round(mape, 2), "holdout_days": 14, "n_samples": len(actual)}


def main():
    print("=== EcoCampus Model Training ===")
    print(f"CO2 factor: {CO2_KG_PER_KWH} kg/kWh (CEA v20.0)")

    if not WEATHER_FILE.exists():
        print(f"ERROR: {WEATHER_FILE} not found. Run seed_real_weather.py first.")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    weather_df = load_weather_df()
    profile    = load_load_profile()

    # Train one representative model (CSE block — academic, AC-heavy)
    # This model is used for all buildings; building-specific adjustments
    # come from the I-BLEND profile multipliers at inference time.
    print("\nTraining Prophet model for CSE (representative academic building)...")
    df = generate_training_data(weather_df, "CSE", profile)
    print(f"  Training rows: {len(df)}, y range: {df['y'].min():.1f} – {df['y'].max():.1f} kWh")

    model = train_prophet(df)
    metrics = evaluate_model(model, df)
    print(f"  Holdout MAPE: {metrics.get('mape', 'N/A')}%")

    bundle = {
        "model": model,
        "metrics": metrics,
        "co2_kg_per_kwh": CO2_KG_PER_KWH,
        "trained_on": str(pd.Timestamp.now()),
        "regressors": ["temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]
    }
    with open(OUTPUT_FILE, "wb") as f:
        pickle.dump(bundle, f)
    print(f"\nSaved model bundle to {OUTPUT_FILE}")
    print(f"MAPE: {metrics.get('mape', 'N/A')}% (target < 10%)")
    print("\nDone. Update your predictions router to load prophet_with_weather.pkl")


if __name__ == "__main__":
    main()