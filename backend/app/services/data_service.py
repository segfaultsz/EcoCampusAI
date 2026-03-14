"""
EcoCampus AI - Data Service
==============================
Fetches data from Supabase for ML models using REST API.
"""

import os
import httpx
import pandas as pd
from dotenv import load_dotenv

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
