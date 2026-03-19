"""
seed_real_weather.py
Run this manually: python backend/data/seed_real_weather.py
No API key required. Pulls from Open-Meteo Archive (free).
"""
import asyncio
import json
import httpx
from pathlib import Path
from datetime import date, timedelta

OUTPUT_FILE = Path(__file__).parent / "real_weather.json"

CAMPUS_LAT = 19.19917
CAMPUS_LON = 84.74472
START_DATE  = "2025-09-01"
END_DATE    = date.today().isoformat()


async def fetch_weather():
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": CAMPUS_LAT,
        "longitude": CAMPUS_LON,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "hourly": (
            "temperature_2m,relativehumidity_2m,"
            "shortwave_radiation,cloudcover,windspeed_10m"
        ),
        "timezone": "Asia/Kolkata"
    }
    print(f"Fetching weather: {START_DATE} -> {END_DATE}")
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()

    hourly = data["hourly"]
    rows = {}
    for i, t in enumerate(hourly["time"]):
        rows[t] = {
            "temp_c":        hourly["temperature_2m"][i],
            "humidity_pct":  hourly["relativehumidity_2m"][i],
            "radiation_wm2": hourly["shortwave_radiation"][i],
            "cloud_pct":     hourly["cloudcover"][i],
            "wind_kmh":      hourly["windspeed_10m"][i],
        }

    output = {
        "source": "Open-Meteo Archive API",
        "lat": CAMPUS_LAT,
        "lon": CAMPUS_LON,
        "start": START_DATE,
        "end": END_DATE,
        "hourly": rows
    }
    OUTPUT_FILE.write_text(json.dumps(output))
    print(f"Saved {len(rows)} hourly rows to {OUTPUT_FILE}")
    return rows


if __name__ == "__main__":
    asyncio.run(fetch_weather())
    print("Done. Now run: python data/train_model.py")