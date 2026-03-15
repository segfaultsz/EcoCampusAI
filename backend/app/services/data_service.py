"""
EcoCampus AI - Data Service
==============================
Fetches data from Supabase for ML models using REST API.
"""

import os
import httpx
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Import related services and models
# Note: These are imported inside functions or at top level if no circular dependency
from app.services.real_data_service import fetch_historical_weather
from app.models.prophet_model import load_trained_model

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

TIMEOUT = 30.0


def _get(endpoint: str, params: dict = None) -> list[dict]:
    """Make GET request to Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    with httpx.Client() as client:
        resp = client.get(url, headers=HEADERS, params=params or {}, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()


def get_buildings() -> list[dict]:
    """Fetch all buildings."""
    return _get("buildings", {"select": "*", "order": "name.asc"})


def get_building(building_id: str) -> dict:
    """Fetch a single building."""
    data = _get("buildings", {"select": "*", "id": f"eq.{building_id}"})
    return data[0] if data else None


def get_energy_readings(building_id: str = None, days: int = 180) -> pd.DataFrame:
    """
    Fetch energy readings as a DataFrame.
    
    Args:
        building_id: Optional, filter by building
        days: Number of days of history (default: 180 = 6 months)
    """
    params = {
        "select": "building_id,timestamp,consumption_kwh,voltage,current_amp,power_factor,is_peak_hour",
        "order": "timestamp.asc",
        "limit": 50000,
    }
    if building_id:
        params["building_id"] = f"eq.{building_id}"

    if days:
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S")
        params["timestamp"] = f"gte.{cutoff}"

    data = _get("energy_readings", params)
    if not data:
        return pd.DataFrame()

    return pd.DataFrame(data)


def get_waste_records(building_id: str = None, days: int = 180) -> pd.DataFrame:
    """Fetch waste records as a DataFrame."""
    params = {
        "select": "building_id,date,organic_kg,recyclable_kg,ewaste_kg,general_kg",
        "order": "date.asc",
        "limit": 10000,
    }
    if building_id:
        params["building_id"] = f"eq.{building_id}"

    if days:
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        params["date"] = f"gte.{cutoff}"

    data = _get("waste_records", params)
    if not data:
        return pd.DataFrame()

    return pd.DataFrame(data)


def get_recent_energy(building_id: str, hours: int = 48) -> pd.DataFrame:
    """Fetch recent energy readings for anomaly detection."""
    params = {
        "select": "building_id,timestamp,consumption_kwh,voltage,current_amp,power_factor,is_peak_hour",
        "building_id": f"eq.{building_id}",
        "order": "timestamp.desc",
        "limit": hours,
    }
    data = _get("energy_readings", params)
    if not data:
        return pd.DataFrame()

    df = pd.DataFrame(data)
    return df.sort_values("timestamp")


def save_predictions(predictions: list[dict]) -> bool:
    """Save prediction results to Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/predictions"
    with httpx.Client() as client:
        resp = client.post(
            url, json=predictions,
            headers={**HEADERS, "Prefer": "return=minimal"},
            timeout=TIMEOUT,
        )
        return resp.status_code in (200, 201)


def save_anomalies(anomalies: list[dict]) -> bool:
    """Save detected anomalies to Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/anomalies"
    with httpx.Client() as client:
        resp = client.post(
            url, json=anomalies,
            headers={**HEADERS, "Prefer": "return=minimal"},
            timeout=TIMEOUT,
        )
        return resp.status_code in (200, 201)


def save_recommendations(recommendations: list[dict]) -> bool:
    """Save generated recommendations to Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/recommendations"
    with httpx.Client() as client:
        resp = client.post(
            url, json=recommendations,
            headers={**HEADERS, "Prefer": "return=minimal"},
            timeout=TIMEOUT,
        )
        return resp.status_code in (200, 201)


async def get_hourly_stats(building_id: str = "ALL") -> list[dict]:
    """
    Fetches hourly energy, predicted energy, and temperature for the last 24 hours.
    Used for the Dashboard hourly chart.
    """
    # 1. Fetch historical energy readings
    bid_filter = None if building_id == "ALL" else building_id
    
    # Get last 2 days to ensure we have a full 24h window
    energy_df = get_energy_readings(bid_filter, days=2)
    if energy_df.empty:
        # Fallback to empty hourly slots if no data
        now = datetime.now()
        return [
            {"hour": (now - timedelta(hours=23-i)).strftime("%H:00"), "kwh": None, "predicted": None, "temp": None}
            for i in range(24)
        ]

    # Ensure timestamp is datetime
    energy_df["timestamp"] = pd.to_datetime(energy_df["timestamp"])
    
    # Group by hour and sum kwh
    energy_df["hour_key"] = energy_df["timestamp"].dt.strftime("%Y-%m-%dT%H:00")
    hourly_energy = energy_df.groupby("hour_key").agg({
        "consumption_kwh": "sum"
    }).reset_index()
    hourly_energy.columns = ["timestamp", "kwh"]
    
    # 2. Fetch temperature data
    now = datetime.now()
    start_date = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    end_date = now.strftime("%Y-%m-%d")
    try:
        weather_rows = await fetch_historical_weather(start_date, end_date)
    except Exception:
        weather_rows = []
    
    weather_map = {w["time"]: w for w in weather_rows}

    # 3. Fetch predictions
    bundle = load_trained_model()
    predictions_map = {}
    
    cutoff_dt = now - timedelta(hours=24)
    cutoff_str = cutoff_dt.strftime("%Y-%m-%dT%H:00")

    if bundle and "model" in bundle and weather_rows:
        model = bundle["model"]
        w_df = pd.DataFrame(weather_rows)
        w_df["ds"] = pd.to_datetime(w_df["time"]).dt.tz_localize(None)
        
        # Prepare predict_df for Prophet
        # Note: weather_rows has 'shortwave_radiation_wm2' etc.
        predict_df = w_df[["ds", "temp_c", "shortwave_radiation_wm2", "cloud_cover_pct", "humidity_pct"]].copy()
        predict_df.columns = ["ds", "temp_c", "radiation_wm2", "cloud_pct", "humidity_pct"]
        
        # Filter weather for the window (last 24 hours up to now)
        predict_df = predict_df[predict_df["ds"] >= pd.Timestamp(cutoff_dt).replace(minute=0, second=0, microsecond=0)]
        
        if not predict_df.empty:
            try:
                forecast = model.predict(predict_df)
                predictions_map = {row["ds"].strftime("%Y-%m-%dT%H:00"): row["yhat"] for _, row in forecast.iterrows()}
            except Exception:
                predictions_map = {}

    # 4. Combine into final result (last 24 slots)
    result = []
    for i in range(24):
        t = now - timedelta(hours=(23-i))
        t = t.replace(minute=0, second=0, microsecond=0)
        hour_key = t.strftime("%Y-%m-%dT%H:00")
        display_hour = t.strftime("%H:00")
        
        # Actual
        actual_val = hourly_energy[hourly_energy["timestamp"] == hour_key]["kwh"]
        actual_kwh = float(actual_val.iloc[0]) if not actual_val.empty else None
        
        # Weather
        weather_val = weather_map.get(hour_key)
        temp = weather_val["temp_c"] if weather_val else None
        
        # Predicted
        predicted = predictions_map.get(hour_key)
        
        result.append({
            "hour": display_hour,
            "kwh": round(actual_kwh, 2) if actual_kwh is not None else None,
            "predicted": round(float(predicted), 2) if predicted is not None else None,
            "temp": round(float(temp), 1) if temp is not None else None
        })
        
    return result
