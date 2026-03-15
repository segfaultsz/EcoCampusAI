import httpx
import os
import json
from datetime import date, timedelta

try:
    from supabase import create_client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    print("WARNING: supabase package not installed. Solar/AQI DB persistence disabled.")

CAMPUS_LAT = float(os.getenv("CAMPUS_LAT", "20.2961"))
CAMPUS_LON = float(os.getenv("CAMPUS_LON", "85.8245"))
DATA_GOV_KEY = os.getenv("DATA_GOV_IN_KEY", "")

if HAS_SUPABASE:
    _url = os.getenv("SUPABASE_URL")
    _key = os.getenv("SUPABASE_SERVICE_KEY")
    if _url and _key:
        supabase = create_client(_url, _key)
    else:
        supabase = None
        HAS_SUPABASE = False
else:
    supabase = None


async def get_config(key: str, default: str = "") -> str:
    """Read a value from the app_config table."""
    try:
        result = supabase.table("app_config").select("value").eq("key", key).single().execute()
        return result.data["value"] if result.data else default
    except Exception:
        return default


async def fetch_historical_weather(start_date: str, end_date: str) -> list[dict]:
    """
    Fetch hourly historical weather from Open-Meteo Archive API.
    Args:
        start_date: "YYYY-MM-DD" e.g. "2025-09-01"
        end_date:   "YYYY-MM-DD" e.g. "2026-03-14"
    Returns list of hourly dicts with: time, temp_c, humidity_pct,
            shortwave_radiation_wm2, cloud_cover_pct, wind_speed_kmh
    This data is used to REPLACE mock weather in the synthetic data generator.
    """
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": CAMPUS_LAT,
        "longitude": CAMPUS_LON,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "temperature_2m,relativehumidity_2m,shortwave_radiation,cloudcover,windspeed_10m",
        "timezone": "Asia/Kolkata"
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()["hourly"]

    rows = []
    for i, t in enumerate(data["time"]):
        rows.append({
            "time": t,
            "temp_c": data["temperature_2m"][i],
            "humidity_pct": data["relativehumidity_2m"][i],
            "shortwave_radiation_wm2": data["shortwave_radiation"][i],
            "cloud_cover_pct": data["cloudcover"][i],
            "wind_speed_kmh": data["windspeed_10m"][i],
        })
    return rows


async def fetch_live_solar() -> list[dict]:
    """
    Fetch 7-day hourly solar forecast from Open-Meteo (free, no key).
    Upserts into solar_readings table.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": CAMPUS_LAT,
        "longitude": CAMPUS_LON,
        "hourly": "shortwave_radiation,cloudcover,temperature_2m",
        "forecast_days": 7,
        "timezone": "Asia/Kolkata"
    }
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()["hourly"]

    rows = [
        {
            "timestamp": t + ":00+05:30",
            "irradiance_wm2": data["shortwave_radiation"][i],
            "cloud_cover_pct": data["cloudcover"][i],
            "temp_c": data["temperature_2m"][i],
            "source": "open-meteo"
        }
        for i, t in enumerate(data["time"])
        if data["shortwave_radiation"][i] is not None
    ]
    if rows and HAS_SUPABASE:
        supabase.table("solar_readings").upsert(rows, on_conflict="timestamp").execute()
    return rows


async def get_current_solar() -> dict | None:
    """Returns latest solar reading from DB, fetching live if empty."""
    if HAS_SUPABASE:
        try:
            result = (
                supabase.table("solar_readings")
                .select("*")
                .order("timestamp", desc=True)
                .limit(1)
                .execute()
            )
            if result.data:
                return result.data[0]
        except Exception:
            pass
    rows = await fetch_live_solar()
    return rows[0] if rows else None


async def fetch_aqi() -> dict | None:
    """
    Fetch current AQI for Bhubaneswar from CPCB via data.gov.in API.
    Requires DATA_GOV_IN_KEY env variable.
    API docs: https://data.gov.in/resource/real-time-air-quality-index-various-locations
    Returns dict with: aqi, pm25, pm10, station_name, timestamp
    """
    if not DATA_GOV_KEY:
        return None
    url = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
    params = {
        "api-key": DATA_GOV_KEY,
        "format": "json",
        "filters[city]": "Bhubaneswar",
        "limit": 50
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            records = r.json().get("records", [])
            if not records:
                return None
            
            # Group records by station
            stations = {}
            for rec in records:
                s_name = rec.get("station")
                if not s_name:
                    continue
                if s_name not in stations:
                    stations[s_name] = {"last_update": rec.get("last_update")}
                
                p_id = rec.get("pollutant_id")
                p_avg = rec.get("pollutant_avg")
                if p_avg and p_avg != "NA":
                    try:
                        stations[s_name][p_id] = float(p_avg)
                    except ValueError:
                        pass

            if not stations:
                return None
            
            # Pick the first station that has data
            station_name = list(stations.keys())[0]
            data = stations[station_name]
            
            pm25 = data.get("PM2.5", 0)
            pm10 = data.get("PM10", 0)
            # AQI is typically the maximum of the sub-indices (pollutant_avg values)
            aqi = max([v for k, v in data.items() if isinstance(v, (int, float))], default=0)

            row = {
                "timestamp": data.get("last_update", ""),
                "aqi": int(aqi),
                "pm25": float(pm25),
                "pm10": float(pm10),
                "station_name": station_name,
                "source": "cpcb"
            }
            if HAS_SUPABASE:
                try:
                    supabase.table("aqi_readings").upsert([row], on_conflict="timestamp").execute()
                except Exception:
                    pass # Non-critical if DB fails
            return row
    except Exception as e:
        print(f"Error fetching AQI: {e}")
        return None


async def get_current_aqi() -> dict | None:
    """Returns latest AQI from DB, fetching live if stale (> 1 hour)."""
    if HAS_SUPABASE:
        try:
            result = (
                supabase.table("aqi_readings")
                .select("*")
                .order("timestamp", desc=True)
                .limit(1)
                .execute()
            )
            if result.data:
                return result.data[0]
        except Exception:
            pass

    live = await fetch_aqi()
    if live:
        return live

    # Fallback: return realistic mock AQI data for Bhubaneswar
    # so the dashboard always renders something useful
    from datetime import datetime
    import random
    base_aqi = random.randint(55, 120)
    return {
        "timestamp": datetime.now().isoformat(),
        "aqi": base_aqi,
        "pm25": round(base_aqi * 0.4 + random.uniform(-5, 5), 1),
        "pm10": round(base_aqi * 0.8 + random.uniform(-10, 10), 1),
        "station_name": "Bhubaneswar (Simulated)",
        "source": "fallback"
    }


async def get_sunrise_sunset(for_date: str | None = None) -> dict:
    """
    Get sunrise and sunset times for the campus location.
    Uses sunrise-sunset.org (free, no key needed).
    Args:
        for_date: "YYYY-MM-DD" or None for today
    Returns dict with: sunrise (ISO string), sunset (ISO string), day_length_seconds
    """
    if for_date is None:
        for_date = date.today().isoformat()
    url = "https://api.sunrise-sunset.org/json"
    params = {
        "lat": CAMPUS_LAT,
        "lng": CAMPUS_LON,
        "date": for_date,
        "formatted": 0
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            results = r.json().get("results", {})
            return {
                "sunrise": results.get("sunrise"),
                "sunset": results.get("sunset"),
                "day_length_seconds": results.get("day_length"),
                "date": for_date
            }
    except Exception:
        return {"sunrise": None, "sunset": None, "day_length_seconds": None, "date": for_date}