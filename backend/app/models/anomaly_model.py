"""
EcoCampus AI - Anomaly Detection Engine
=========================================
Uses Isolation Forest for detecting anomalous energy consumption patterns.
Provides severity classification and human-readable explanations.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

try:
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    print("WARNING: scikit-learn not installed. Using Z-score fallback.")


class AnomalyDetector:
    """Detects anomalous energy consumption patterns."""

    def __init__(self, contamination: float = 0.05):
        """
        Args:
            contamination: Expected proportion of anomalies (default 5%)
        """
        self.contamination = contamination
        self.models = {}   # building_id -> trained IsolationForest
        self.scalers = {}  # building_id -> StandardScaler
        self.baselines = {}  # building_id -> baseline stats

    def _extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract features for anomaly detection from energy readings."""
        df = df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["hour"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
        df["month"] = df["timestamp"].dt.month

        # Rolling statistics
        df = df.sort_values("timestamp")
        df["rolling_mean_24h"] = df["consumption_kwh"].rolling(24, min_periods=1).mean()
        df["rolling_std_24h"] = df["consumption_kwh"].rolling(24, min_periods=1).std().fillna(0)

        # Deviation from rolling mean
        df["deviation"] = (df["consumption_kwh"] - df["rolling_mean_24h"]) / (df["rolling_std_24h"] + 0.01)

        # Ratio to hourly average (how different from typical at this hour)
        hourly_avg = df.groupby("hour")["consumption_kwh"].transform("mean")
        df["hourly_ratio"] = df["consumption_kwh"] / (hourly_avg + 0.01)

        feature_cols = [
            "consumption_kwh", "hour", "day_of_week", "is_weekend",
            "rolling_mean_24h", "deviation", "hourly_ratio"
        ]

        return df, feature_cols

    def train(self, building_id: str, energy_data: pd.DataFrame) -> dict:
        """Train anomaly detection model for a building."""
        df, feature_cols = self._extract_features(energy_data)

        # Store baseline statistics
        self.baselines[building_id] = {
            "hourly_means": df.groupby("hour")["consumption_kwh"].mean().to_dict(),
            "hourly_stds": df.groupby("hour")["consumption_kwh"].std().to_dict(),
            "overall_mean": float(df["consumption_kwh"].mean()),
            "overall_std": float(df["consumption_kwh"].std()),
            "p95": float(df["consumption_kwh"].quantile(0.95)),
        }

        if HAS_SKLEARN:
            return self._train_isolation_forest(building_id, df, feature_cols)
        else:
            return self._store_baselines(building_id)

    def _train_isolation_forest(self, building_id: str, df: pd.DataFrame, feature_cols: list) -> dict:
        """Train Isolation Forest model."""
        X = df[feature_cols].fillna(0).values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100,
            max_samples="auto",
        )
        model.fit(X_scaled)

        # Get training anomaly predictions
        predictions = model.predict(X_scaled)
        anomaly_count = int((predictions == -1).sum())
        anomaly_rate = anomaly_count / len(predictions)

        self.models[building_id] = model
        self.scalers[building_id] = scaler

        return {
            "building_id": building_id,
            "model_type": "isolation_forest",
            "training_samples": len(df),
            "detected_anomalies": anomaly_count,
            "anomaly_rate": round(anomaly_rate * 100, 2),
        }

    def _store_baselines(self, building_id: str) -> dict:
        return {
            "building_id": building_id,
            "model_type": "z_score_fallback",
            "training_samples": 0,
            "detected_anomalies": 0,
            "anomaly_rate": 0,
        }

    def detect(self, building_id: str, recent_data: pd.DataFrame) -> list[dict]:
        """
        Run anomaly detection on recent data.
        Returns list of detected anomalies with explanations.
        """
        if building_id not in self.baselines:
            return []

        df, feature_cols = self._extract_features(recent_data)
        baseline = self.baselines[building_id]

        anomalies = []

        if HAS_SKLEARN and building_id in self.models:
            X = df[feature_cols].fillna(0).values
            X_scaled = self.scalers[building_id].transform(X)
            predictions = self.models[building_id].predict(X_scaled)
            scores = self.models[building_id].decision_function(X_scaled)

            for i, (pred, score) in enumerate(zip(predictions, scores)):
                if pred == -1:
                    row = df.iloc[i]
                    anomaly = self._create_anomaly(row, score, baseline)
                    if anomaly:
                        anomalies.append(anomaly)
        else:
            # Z-score fallback
            for _, row in df.iterrows():
                hour = int(row["hour"])
                expected = baseline["hourly_means"].get(hour, baseline["overall_mean"])
                std = baseline["hourly_stds"].get(hour, baseline["overall_std"])
                if std > 0:
                    z_score = (row["consumption_kwh"] - expected) / std
                    if abs(z_score) > 2.5:
                        anomaly = self._create_anomaly(row, -abs(z_score), baseline)
                        if anomaly:
                            anomalies.append(anomaly)

        return anomalies

    def _create_anomaly(self, row: pd.Series, score: float, baseline: dict) -> dict:
        """Create an anomaly record with classification and explanation."""
        actual = float(row["consumption_kwh"])
        hour = int(row["hour"])
        expected = baseline["hourly_means"].get(hour, baseline["overall_mean"])
        deviation_pct = ((actual - expected) / expected) * 100 if expected > 0 else 0

        # Classify severity
        abs_dev = abs(deviation_pct)
        if abs_dev > 100:
            severity = "critical"
        elif abs_dev > 60:
            severity = "high"
        elif abs_dev > 30:
            severity = "medium"
        else:
            severity = "low"

        # Classify anomaly type
        is_after_hours = hour < 6 or hour > 20
        is_weekend = int(row.get("is_weekend", 0))

        if is_after_hours and actual > expected * 1.5:
            anomaly_type = "after_hours"
            explanation = f"High consumption of {actual:.1f} kWh detected at {hour}:00 when building should be at low usage. Expected ~{expected:.1f} kWh."
        elif actual > baseline["p95"]:
            anomaly_type = "overconsumption"
            explanation = f"Consumption of {actual:.1f} kWh exceeds the 95th percentile ({baseline['p95']:.1f} kWh). This is {deviation_pct:.0f}% above the hourly average."
        elif actual < expected * 0.3 and not is_weekend:
            anomaly_type = "unusual_pattern"
            explanation = f"Unusually low consumption of {actual:.1f} kWh at {hour}:00. Expected ~{expected:.1f} kWh. Possible meter issue or unscheduled shutdown."
        else:
            anomaly_type = "unusual_pattern"
            direction = "above" if actual > expected else "below"
            explanation = f"Consumption of {actual:.1f} kWh is {abs_dev:.0f}% {direction} the expected {expected:.1f} kWh for this hour."

        return {
            "detected_at": row["timestamp"].isoformat() if hasattr(row["timestamp"], "isoformat") else str(row["timestamp"]),
            "anomaly_type": anomaly_type,
            "severity": severity,
            "description": explanation,
            "actual_kwh": round(actual, 2),
            "expected_kwh": round(expected, 2),
            "deviation_pct": round(deviation_pct, 1),
            "anomaly_score": round(float(score), 4),
        }
