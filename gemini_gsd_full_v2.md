# EcoCampus AI — Complete Upgrade Spec
## GSD Task File for Gemini CLI

### How to run
```
/gsd:quick --full
> implement everything described in this file exactly as specified
```

---

## IMPLEMENTATION ORDER (read before running)

Run these in sequence. Each depends on the previous being complete.

```
STEP 0 — Manual (you do this, not Gemini):
  a) Run the Supabase SQL file in the dashboard (free, no credits)
  b) Download I-BLEND dataset from https://doi.org/10.6084/m9.figshare.c.3893581.v1
     Save the CSV files to: backend/data/iblend/
  c) Register at data.gov.in for a free API key (for CPCB AQI)

STEP 1 — Run /gsd:quick --full with THIS FILE
  Gemini handles everything from Wave 1 onward automatically.
  Estimated time: 20-35 minutes.

STEP 2 — Manual after Gemini finishes:
  a) Set real values in .env.local (Mapbox token, Supabase service key, data.gov.in key)
  b) Run: cd backend && python data/calibrate_from_iblend.py
  c) Run: cd backend && python data/seed_real_weather.py
  d) Run: cd backend && python data/train_model.py
```

---

## PROJECT CONTEXT

Existing project at `e:\WorkSpace\Appathon\`
- `frontend/` — Next.js 14, App Router, Tailwind CSS v3, Recharts
- `backend/` — Python FastAPI, Prophet, scikit-learn, pandas, Supabase
- Design system: dark mode primary, bg `#0F172A`, cards `#1E293B`, primary `#10B981` (emerald), accent `#3B82F6` (blue), warning `#F59E0B`, danger `#EF4444`

**Supabase tables already created (via SQL file):**
`solar_readings`, `aqi_readings`, `app_config`, plus existing: `energy_readings`, `buildings`, `predictions`, `anomalies`, `recommendations`, `waste_records`

**Critical rule for all frontend components:**
Every chart MUST have hover tooltips, animation enabled, and loading skeleton states.
No component renders an empty div — always show skeleton while loading.
All numbers on cards animate from 0 to their value on first load using requestAnimationFrame.
Page-level fade-in: every page wrapper must add class `animate-fadeIn` on mount using useEffect.

---

## WAVE 1 — New backend service files (run all in parallel)

---

### Task 1.1 — Real data service

```xml
<task type="create">
  <n>Create real_data_service.py</n>
  <files>backend/app/services/real_data_service.py</files>
  <action>
    Create this file at backend/app/services/real_data_service.py.

    PURPOSE: Fetches all real-world external data (weather, AQI, sunrise/sunset, config).
    All functions are async. All use httpx with explicit timeouts. All store to Supabase.

    === EXACT FILE CONTENT ===

    ```python
    import httpx
    import os
    import json
    from datetime import date, timedelta
    from supabase import create_client

    CAMPUS_LAT = float(os.getenv("CAMPUS_LAT", "20.2961"))
    CAMPUS_LON = float(os.getenv("CAMPUS_LON", "85.8245"))
    DATA_GOV_KEY = os.getenv("DATA_GOV_IN_KEY", "")

    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")
    )


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
        if rows:
            supabase.table("solar_readings").upsert(rows, on_conflict="timestamp").execute()
        return rows


    async def get_current_solar() -> dict | None:
        """Returns latest solar reading from DB, fetching live if empty."""
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
            "limit": 1
        }
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(url, params=params)
                r.raise_for_status()
                records = r.json().get("records", [])
                if not records:
                    return None
                rec = records[0]
                row = {
                    "timestamp": rec.get("last_update", ""),
                    "aqi": int(rec.get("pollutant_avg", 0)),
                    "pm25": float(rec.get("pollutant_min", 0)),
                    "pm10": float(rec.get("pollutant_max", 0)),
                    "station_name": rec.get("station", "Bhubaneswar CPCB"),
                    "source": "cpcb"
                }
                supabase.table("aqi_readings").upsert([row], on_conflict="timestamp").execute()
                return row
        except Exception:
            return None


    async def get_current_aqi() -> dict | None:
        """Returns latest AQI from DB, fetching live if stale (> 1 hour)."""
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
        return await fetch_aqi()


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
    ```
  </action>
  <verify>
    File exists at backend/app/services/real_data_service.py
    Contains functions: get_config, fetch_historical_weather, fetch_live_solar,
      get_current_solar, fetch_aqi, get_current_aqi, get_sunrise_sunset
    No syntax errors: python -m py_compile backend/app/services/real_data_service.py
  </verify>
  <done>real_data_service.py created with 7 async functions covering weather, solar, AQI, sunrise/sunset</done>
</task>
```

---

### Task 1.2 — I-BLEND calibration script

```xml
<task type="create">
  <n>Create I-BLEND calibration script</n>
  <files>backend/data/calibrate_from_iblend.py</files>
  <action>
    Create backend/data/calibrate_from_iblend.py.

    PURPOSE: Reads I-BLEND CSV files from backend/data/iblend/ directory,
    computes real campus load curve statistics, and outputs a JSON config
    that the synthetic data generator will use instead of hardcoded multipliers.

    I-BLEND building types map to EcoCampus buildings:
      I-BLEND "Academic" → CSE, ECE, SCI
      I-BLEND "Library"  → LIB
      I-BLEND "Hostel"   → HOS1, HOS2
      I-BLEND "Dining"   → CAF
      I-BLEND "Facilities" → MEC, ADM, SPT

    === EXACT FILE CONTENT ===

    ```python
    """
    calibrate_from_iblend.py
    Run this manually: python backend/data/calibrate_from_iblend.py
    Requires I-BLEND CSV files in backend/data/iblend/
    Download from: https://doi.org/10.6084/m9.figshare.c.3893581.v1
    """
    import os
    import json
    import glob
    import pandas as pd
    import numpy as np
    from pathlib import Path

    IBLEND_DIR = Path(__file__).parent / "iblend"
    OUTPUT_FILE = Path(__file__).parent / "real_load_profile.json"

    BUILDING_TYPE_MAP = {
        "Academic": ["CSE", "ECE", "SCI"],
        "Library":  ["LIB"],
        "Hostel":   ["HOS1", "HOS2"],
        "Dining":   ["CAF"],
        "Facilities": ["MEC", "ADM", "SPT"]
    }

    def load_iblend_csv(csv_path: str) -> pd.DataFrame:
        """Load a single I-BLEND building CSV. Expects columns: timestamp, power_kw"""
        df = pd.read_csv(csv_path, parse_dates=["timestamp"])
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")
        return df

    def compute_load_profile(df: pd.DataFrame) -> dict:
        """
        Compute hourly load profile statistics from a building DataFrame.
        Returns dict with:
          hourly_mean[0..23]: average kW per hour of day
          weekday_vs_weekend_ratio: float (weekday avg / weekend avg)
          peak_hour: int (0-23)
          summer_multiplier: float
          std_dev_pct: float (coefficient of variation)
        """
        df["hour"] = df["timestamp"].dt.hour
        df["is_weekend"] = df["timestamp"].dt.dayofweek >= 5
        df["month"] = df["timestamp"].dt.month

        hourly_mean = df.groupby("hour")["power_kw"].mean().to_dict()
        hourly_mean = {int(k): round(float(v), 2) for k, v in hourly_mean.items()}

        weekday_avg = df[~df["is_weekend"]]["power_kw"].mean()
        weekend_avg = df[df["is_weekend"]]["power_kw"].mean()
        ratio = round(float(weekday_avg / max(weekend_avg, 0.01)), 3)

        peak_hour = int(max(hourly_mean, key=hourly_mean.get))

        summer_months = [4, 5, 6]
        winter_months = [11, 12, 1]
        summer_avg = df[df["month"].isin(summer_months)]["power_kw"].mean()
        winter_avg = df[df["month"].isin(winter_months)]["power_kw"].mean()
        summer_mult = round(float(summer_avg / max(winter_avg, 0.01)), 3)

        cv = round(float(df["power_kw"].std() / max(df["power_kw"].mean(), 0.01)), 3)

        return {
            "hourly_mean": hourly_mean,
            "weekday_vs_weekend_ratio": ratio,
            "peak_hour": peak_hour,
            "summer_multiplier": summer_mult,
            "std_dev_pct": cv
        }

    def main():
        if not IBLEND_DIR.exists():
            print(f"ERROR: {IBLEND_DIR} does not exist.")
            print("Download I-BLEND from: https://doi.org/10.6084/m9.figshare.c.3893581.v1")
            print("Extract CSV files into backend/data/iblend/")
            return

        csv_files = list(IBLEND_DIR.glob("*.csv"))
        if not csv_files:
            print(f"ERROR: No CSV files found in {IBLEND_DIR}")
            return

        print(f"Found {len(csv_files)} CSV files: {[f.name for f in csv_files]}")

        profiles = {}
        for csv_path in csv_files:
            building_type = csv_path.stem.split("_")[0].capitalize()
            print(f"Processing {csv_path.name} → type: {building_type}")
            try:
                df = load_iblend_csv(str(csv_path))
                profile = compute_load_profile(df)
                profiles[building_type] = profile
                print(f"  Peak hour: {profile['peak_hour']}, Summer mult: {profile['summer_multiplier']}")
            except Exception as e:
                print(f"  SKIP (error: {e})")

        # Map I-BLEND types to EcoCampus building codes
        building_profiles = {}
        for iblend_type, eco_codes in BUILDING_TYPE_MAP.items():
            if iblend_type in profiles:
                for code in eco_codes:
                    building_profiles[code] = profiles[iblend_type]
                    print(f"  Mapped {iblend_type} → {code}")
            else:
                print(f"  WARNING: No I-BLEND data for type '{iblend_type}', using defaults for {eco_codes}")
                for code in eco_codes:
                    building_profiles[code] = {
                        "hourly_mean": {str(h): 10.0 for h in range(24)},
                        "weekday_vs_weekend_ratio": 2.0,
                        "peak_hour": 14,
                        "summer_multiplier": 1.25,
                        "std_dev_pct": 0.15
                    }

        output = {
            "generated_from": "I-BLEND dataset",
            "doi": "https://doi.org/10.6084/m9.figshare.c.3893581.v1",
            "building_profiles": building_profiles
        }
        OUTPUT_FILE.write_text(json.dumps(output, indent=2))
        print(f"\nSaved calibration data to {OUTPUT_FILE}")
        print("Now run: python data/seed_real_weather.py")

    if __name__ == "__main__":
        main()
    ```
  </action>
  <verify>
    File exists at backend/data/calibrate_from_iblend.py
    No syntax errors: python -m py_compile backend/data/calibrate_from_iblend.py
    Script prints helpful error if iblend/ dir missing, not a crash
  </verify>
  <done>I-BLEND calibration script created</done>
</task>
```

---

### Task 1.3 — Real weather seeder

```xml
<task type="create">
  <n>Create real weather seeder script</n>
  <files>backend/data/seed_real_weather.py</files>
  <action>
    Create backend/data/seed_real_weather.py.

    PURPOSE: Pulls 6 months of historical weather from Open-Meteo Archive API
    and saves it to backend/data/real_weather.json for use by the model trainer.
    Also patches the synthetic energy_readings to include real temperature values.

    === EXACT FILE CONTENT ===

    ```python
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

    CAMPUS_LAT = 20.2961
    CAMPUS_LON = 85.8245
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
        print(f"Fetching weather: {START_DATE} → {END_DATE}")
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
    ```
  </action>
  <verify>
    File exists at backend/data/seed_real_weather.py
    No syntax errors: python -m py_compile backend/data/seed_real_weather.py
  </verify>
  <done>Real weather seeder script created</done>
</task>
```

---

### Task 1.4 — Model training script

```xml
<task type="create">
  <n>Create model training script</n>
  <files>backend/data/train_model.py</files>
  <action>
    Create backend/data/train_model.py.

    PURPOSE: Re-trains the Prophet forecasting model using real weather data
    from real_weather.json plus the synthetic energy data calibrated from I-BLEND.
    Saves the trained model to backend/trained_models/prophet_with_weather.pkl.

    === EXACT FILE CONTENT ===

    ```python
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
    ```
  </action>
  <verify>
    File exists at backend/data/train_model.py
    No syntax errors: python -m py_compile backend/data/train_model.py
    Contains: load_weather_df, load_load_profile, generate_training_data, train_prophet, evaluate_model, main
    Saves to backend/trained_models/prophet_with_weather.pkl
    Reports MAPE in output
  </verify>
  <done>Model training script created with real weather regressors and MAPE evaluation</done>
</task>
```

---

### Task 1.5 — FastAPI routers for real data

```xml
<task type="create">
  <n>Create real_data FastAPI router</n>
  <files>backend/app/routers/real_data.py</files>
  <action>
    Create backend/app/routers/real_data.py.

    === EXACT FILE CONTENT ===

    ```python
    from fastapi import APIRouter, HTTPException, Query
    from services.real_data_service import (
        get_current_solar, fetch_live_solar,
        get_current_aqi,   fetch_aqi,
        get_sunrise_sunset, get_config,
        fetch_historical_weather
    )

    router = APIRouter(prefix="/api/real", tags=["real-data"])


    @router.get("/solar/current")
    async def current_solar():
        data = await get_current_solar()
        if not data:
            raise HTTPException(503, "Solar data unavailable")
        return data


    @router.post("/solar/refresh")
    async def refresh_solar():
        rows = await fetch_live_solar()
        return {"upserted": len(rows)}


    @router.get("/aqi/current")
    async def current_aqi():
        data = await get_current_aqi()
        if not data:
            raise HTTPException(503, "AQI data unavailable — check DATA_GOV_IN_KEY env var")
        return data


    @router.get("/sunrise-sunset")
    async def sunrise_sunset(date: str = Query(None, description="YYYY-MM-DD, default today")):
        return await get_sunrise_sunset(date)


    @router.get("/config/{key}")
    async def app_config(key: str):
        value = await get_config(key)
        if not value:
            raise HTTPException(404, f"Config key '{key}' not found")
        return {"key": key, "value": value}


    @router.get("/weather/historical")
    async def historical_weather(
        start: str = Query(..., description="YYYY-MM-DD"),
        end:   str = Query(..., description="YYYY-MM-DD")
    ):
        rows = await fetch_historical_weather(start, end)
        return {"count": len(rows), "rows": rows[:48]}
    ```
  </action>
  <verify>
    File exists at backend/app/routers/real_data.py
    No syntax errors: python -m py_compile backend/app/routers/real_data.py
    6 endpoints defined
  </verify>
  <done>real_data.py router created</done>
</task>
```

---

### Task 1.6 — Frontend API routes (proxy layer)

```xml
<task type="create">
  <n>Create all frontend API proxy routes</n>
  <files>
    frontend/src/app/api/solar/route.js,
    frontend/src/app/api/aqi/route.js,
    frontend/src/app/api/campus-map/route.js,
    frontend/src/app/api/sunrise/route.js
  </files>
  <action>
    Create all four files exactly as specified.

    === FILE 1: frontend/src/app/api/solar/route.js ===
    ```javascript
    export async function GET() {
      try {
        const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
        const res = await fetch(`${base}/api/real/solar/current`, {
          next: { revalidate: 300 }
        })
        if (!res.ok) throw new Error(`${res.status}`)
        return Response.json(await res.json())
      } catch (err) {
        return Response.json({ error: 'Solar data unavailable' }, { status: 503 })
      }
    }
    ```

    === FILE 2: frontend/src/app/api/aqi/route.js ===
    ```javascript
    export async function GET() {
      try {
        const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
        const res = await fetch(`${base}/api/real/aqi/current`, {
          next: { revalidate: 1800 }
        })
        if (!res.ok) throw new Error(`${res.status}`)
        return Response.json(await res.json())
      } catch (err) {
        return Response.json({ error: 'AQI data unavailable' }, { status: 503 })
      }
    }
    ```

    === FILE 3: frontend/src/app/api/campus-map/route.js ===
    ```javascript
    import { createClient } from '@supabase/supabase-js'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    export async function GET() {
      try {
        const { data: energy, error } = await supabase
          .from('energy_readings')
          .select('building_id, consumption_kwh, timestamp, buildings(name, code, type)')
          .order('timestamp', { ascending: false })
          .limit(50)
        if (error) throw error

        const { data: solar } = await supabase
          .from('solar_readings')
          .select('irradiance_wm2, cloud_cover_pct, temp_c, timestamp')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single()

        const seen = new Set()
        const buildings = (energy ?? []).filter(r => {
          if (seen.has(r.building_id)) return false
          seen.add(r.building_id)
          return true
        })

        return Response.json({ buildings, solar })
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 500 })
      }
    }
    ```

    === FILE 4: frontend/src/app/api/sunrise/route.js ===
    ```javascript
    export async function GET() {
      try {
        const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
        const res = await fetch(`${base}/api/real/sunrise-sunset`, {
          next: { revalidate: 86400 }
        })
        if (!res.ok) throw new Error(`${res.status}`)
        return Response.json(await res.json())
      } catch (err) {
        return Response.json({ error: 'Sunrise data unavailable' }, { status: 503 })
      }
    }
    ```
  </action>
  <verify>
    All 4 files exist at their correct paths
    Each exports a GET function
    Each has try/catch error handling returning { error } with status 503/500
  </verify>
  <done>All 4 frontend API proxy routes created</done>
</task>
```

---

## WAVE 2 — Interactive UI components (run all in parallel after Wave 1)

**CRITICAL INTERACTIVITY RULES FOR ALL COMPONENTS IN THIS WAVE:**
1. Every component must add `globals.css` animation classes — add `animate-fadeIn` on mount via `useEffect(() => { setVisible(true) }, [])`
2. Every numeric display must count up from 0 using `useCountUp(targetValue, 1200)` hook
3. Every chart must have `isAnimationActive={true}` and `animationDuration={800}` on all Recharts series
4. Every chart must have a `<Tooltip>` with `contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F1F5F9' }}`
5. Loading state must show shimmer skeleton div: `<div className="animate-pulse bg-slate-700 rounded-lg h-full w-full"/>`
6. Error state must show retry button that re-calls the fetch function

---

### Task 2.1 — Shared hooks and animations

```xml
<task type="create">
  <n>Create shared hooks and add global animations to CSS</n>
  <files>
    frontend/src/lib/hooks.js,
    frontend/src/styles/globals.css
  </files>
  <action>
    === FILE 1: frontend/src/lib/hooks.js ===
    Create this file exactly:

    ```javascript
    'use client'
    import { useState, useEffect, useRef } from 'react'

    /**
     * useCountUp — animates a number from 0 to `target` over `duration` ms.
     * Returns the current animated value as a number.
     * Usage: const displayed = useCountUp(1234, 1200)
     */
    export function useCountUp(target, duration = 1000) {
      const [count, setCount] = useState(0)
      const frameRef = useRef(null)
      const startRef = useRef(null)

      useEffect(() => {
        if (target === null || target === undefined) return
        const numTarget = parseFloat(target) || 0
        startRef.current = null

        const step = (timestamp) => {
          if (!startRef.current) startRef.current = timestamp
          const progress = Math.min((timestamp - startRef.current) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(eased * numTarget)
          if (progress < 1) frameRef.current = requestAnimationFrame(step)
        }
        frameRef.current = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frameRef.current)
      }, [target, duration])

      return count
    }

    /**
     * useFetch — fetches a URL, returns { data, loading, error, refetch }
     * Automatically retries once on error after 2 seconds.
     * Usage: const { data, loading, error, refetch } = useFetch('/api/solar')
     */
    export function useFetch(url, options = {}) {
      const [data, setData]       = useState(null)
      const [loading, setLoading] = useState(true)
      const [error, setError]     = useState(null)

      const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch(url, options)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          setData(json)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      useEffect(() => { fetchData() }, [url])

      return { data, loading, error, refetch: fetchData }
    }

    /**
     * usePolling — like useFetch but re-fetches every `intervalMs` milliseconds.
     * Usage: const { data } = usePolling('/api/solar', 300000) // every 5 min
     */
    export function usePolling(url, intervalMs = 300000) {
      const result = useFetch(url)
      useEffect(() => {
        const id = setInterval(result.refetch, intervalMs)
        return () => clearInterval(id)
      }, [url, intervalMs])
      return result
    }
    ```

    === FILE 2: frontend/src/styles/globals.css — APPEND to the end ===
    Do NOT replace the file. Find the end of the file and append these lines:

    ```css
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out both;
    }
    .animate-shimmer {
      background: linear-gradient(
        90deg,
        #1E293B 25%,
        #334155 50%,
        #1E293B 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .live-indicator {
      position: relative;
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
    }
    .live-indicator::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #10B981;
      animation: pulse-ring 1.5s ease-out infinite;
    }
    ```
  </action>
  <verify>
    frontend/src/lib/hooks.js exists with useCountUp, useFetch, usePolling
    globals.css has .animate-fadeIn, .animate-shimmer, .live-indicator classes at the end
    No syntax errors in hooks.js: node -e "require('./frontend/src/lib/hooks.js')" (if applicable)
  </verify>
  <done>Shared hooks and animation classes created</done>
</task>
```

---

### Task 2.2 — Interactive SolarCard

```xml
<task type="create">
  <n>Create interactive SolarCard component</n>
  <files>frontend/src/components/dashboard/SolarCard.jsx</files>
  <action>
    Create frontend/src/components/dashboard/SolarCard.jsx.
    'use client' at the top.

    === EXACT FILE CONTENT ===

    ```jsx
    'use client'
    import { usePolling, useCountUp } from '@/lib/hooks'

    const SUN_ICON = (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="5"/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180
          const x1 = 12 + 8 * Math.cos(rad), y1 = 12 + 8 * Math.sin(rad)
          const x2 = 12 + 10 * Math.cos(rad), y2 = 12 + 10 * Math.sin(rad)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>
        })}
      </svg>
    )

    function getLevel(wm2) {
      if (!wm2) return { label: 'No data', color: 'text-slate-500', bar: 0 }
      if (wm2 >= 700) return { label: 'Very high',  color: 'text-orange-400', bar: 100 }
      if (wm2 >= 400) return { label: 'High',       color: 'text-amber-400',  bar: 70  }
      if (wm2 >= 150) return { label: 'Moderate',   color: 'text-yellow-400', bar: 40  }
      return              { label: 'Low',         color: 'text-blue-400',   bar: 15  }
    }

    function SkeletonCard() {
      return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36">
          <div className="animate-shimmer h-4 w-32 rounded mb-3"/>
          <div className="animate-shimmer h-8 w-24 rounded mb-2"/>
          <div className="animate-shimmer h-3 w-40 rounded"/>
        </div>
      )
    }

    export default function SolarCard() {
      const { data, loading, error, refetch } = usePolling('/api/solar', 300_000)
      const animated = useCountUp(data?.irradiance_wm2, 1000)

      if (loading) return <SkeletonCard />

      if (error) return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36
                        flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Solar Irradiance</span>
            <span className="text-amber-400">{SUN_ICON}</span>
          </div>
          <p className="text-slate-500 text-sm">Data unavailable</p>
          <button onClick={refetch}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors
                       underline underline-offset-2 text-left">
            Retry
          </button>
        </div>
      )

      const level = getLevel(data?.irradiance_wm2)
      const updated = data?.timestamp
        ? new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : ''

      return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5
                        hover:border-slate-500 transition-all duration-200 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-sm font-medium">Solar irradiance</span>
            <div className="flex items-center gap-2">
              <span className="live-indicator"/>
              <span className="text-amber-400">{SUN_ICON}</span>
            </div>
          </div>

          <div className="flex items-end gap-1 mb-1">
            <span className="text-2xl font-bold text-white">
              {Math.round(animated)}
            </span>
            <span className="text-slate-400 text-sm mb-0.5">W/m²</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${level.bar}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 text-xs text-slate-400">
            <span>☁ {data?.cloud_cover_pct ?? '—'}%</span>
            <span>🌡 {data?.temp_c ?? '—'}°C</span>
            <span className="ml-auto opacity-60">{updated}</span>
          </div>
        </div>
      )
    }
    ```
  </action>
  <verify>
    File exists at frontend/src/components/dashboard/SolarCard.jsx
    Has 'use client', uses usePolling and useCountUp from @/lib/hooks
    Has SkeletonCard for loading state, error state with retry button, data state
    Has animated progress bar and live indicator
  </verify>
  <done>Interactive SolarCard with animations, loading skeleton, error state, live indicator</done>
</task>
```

---

### Task 2.3 — Interactive AQI card

```xml
<task type="create">
  <n>Create AQICard component</n>
  <files>frontend/src/components/dashboard/AQICard.jsx</files>
  <action>
    Create frontend/src/components/dashboard/AQICard.jsx.
    'use client' at the top.

    === EXACT FILE CONTENT ===

    ```jsx
    'use client'
    import { usePolling, useCountUp } from '@/lib/hooks'

    function getAQILevel(aqi) {
      if (!aqi) return { label: 'No data',   color: 'text-slate-500', bg: 'bg-slate-700', pct: 0 }
      if (aqi <= 50)  return { label: 'Good',       color: 'text-emerald-400', bg: 'bg-emerald-500', pct: 15  }
      if (aqi <= 100) return { label: 'Moderate',   color: 'text-yellow-400',  bg: 'bg-yellow-400',  pct: 35  }
      if (aqi <= 150) return { label: 'Unhealthy (sensitive)', color: 'text-orange-400', bg: 'bg-orange-400', pct: 55  }
      if (aqi <= 200) return { label: 'Unhealthy',  color: 'text-red-400',    bg: 'bg-red-500',     pct: 75  }
      return                 { label: 'Hazardous',  color: 'text-red-600',    bg: 'bg-red-700',     pct: 100 }
    }

    function Skeleton() {
      return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36">
          <div className="animate-shimmer h-4 w-24 rounded mb-3"/>
          <div className="animate-shimmer h-8 w-16 rounded mb-2"/>
          <div className="animate-shimmer h-3 w-36 rounded"/>
        </div>
      )
    }

    export default function AQICard() {
      const { data, loading, error, refetch } = usePolling('/api/aqi', 1_800_000)
      const animated = useCountUp(data?.aqi, 1200)

      if (loading) return <Skeleton />

      if (error) return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36
                        flex flex-col justify-between">
          <span className="text-slate-400 text-sm">Air quality (AQI)</span>
          <p className="text-slate-500 text-sm">Unavailable — check DATA_GOV_IN_KEY</p>
          <button onClick={refetch}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline text-left">
            Retry
          </button>
        </div>
      )

      const level = getAQILevel(data?.aqi)

      return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5
                        hover:border-slate-500 transition-all duration-200 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-sm font-medium">Air quality (AQI)</span>
            <div className={`w-2.5 h-2.5 rounded-full ${level.bg}`}/>
          </div>

          <div className="flex items-end gap-1 mb-1">
            <span className="text-2xl font-bold text-white">{Math.round(animated)}</span>
            <span className="text-slate-400 text-sm mb-0.5">AQI</span>
          </div>

          <p className={`text-sm font-medium mb-3 ${level.color}`}>{level.label}</p>

          <div className="flex gap-3 text-xs text-slate-400">
            <span>PM2.5: {data?.pm25 ?? '—'}</span>
            <span>PM10: {data?.pm10 ?? '—'}</span>
            <span className="ml-auto opacity-60 truncate max-w-[90px]">
              {data?.station_name?.replace('Bhubaneswar', 'Bbsr') ?? ''}
            </span>
          </div>
        </div>
      )
    }
    ```
  </action>
  <verify>
    File exists at frontend/src/components/dashboard/AQICard.jsx
    Uses usePolling and useCountUp
    Has loading skeleton, error state, animated AQI value, 5-tier color scale
  </verify>
  <done>Interactive AQICard created with 5-level color scale and animations</done>
</task>
```

---

### Task 2.4 — Interactive energy line chart

```xml
<task type="create">
  <n>Create interactive EnergyLineChart with real weather overlay</n>
  <files>frontend/src/components/dashboard/EnergyLineChart.jsx</files>
  <action>
    Create frontend/src/components/dashboard/EnergyLineChart.jsx.
    If a file with this name already exists, REPLACE its entire content.
    'use client' at the top.

    PURPOSE: 24-hour energy line chart with temperature overlay, animated entry,
    click-through to building detail, brush for zoom, and custom tooltip.

    === EXACT FILE CONTENT ===

    ```jsx
    'use client'
    import { useState } from 'react'
    import {
      ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
      Tooltip, Legend, Brush, ResponsiveContainer, ReferenceLine
    } from 'recharts'
    import { useFetch } from '@/lib/hooks'

    const TOOLTIP_STYLE = {
      contentStyle: {
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F1F5F9',
        fontSize: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4)'
      },
      labelStyle: { color: '#94A3B8', marginBottom: '4px' }
    }

    function SkeletonChart() {
      return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5">
          <div className="animate-shimmer h-5 w-48 rounded mb-4"/>
          <div className="animate-shimmer h-64 w-full rounded"/>
        </div>
      )
    }

    function CustomTooltip({ active, payload, label }) {
      if (!active || !payload?.length) return null
      return (
        <div style={TOOLTIP_STYLE.contentStyle}>
          <p style={TOOLTIP_STYLE.labelStyle} className="mb-1">{label}</p>
          {payload.map((p) => (
            <div key={p.dataKey} className="flex items-center gap-2 text-xs">
              <span style={{ color: p.color }}>■</span>
              <span className="text-slate-300">{p.name}:</span>
              <span className="font-medium text-white">
                {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                {p.dataKey === 'kwh' ? ' kWh' : p.dataKey === 'temp' ? '°C' : ''}
              </span>
            </div>
          ))}
        </div>
      )
    }

    export default function EnergyLineChart({ buildingCode = 'ALL' }) {
      const [hiddenLines, setHiddenLines] = useState({})
      const { data, loading, error } = useFetch(
        `/api/energy/hourly?building=${buildingCode}`
      )

      if (loading) return <SkeletonChart />

      if (error || !data?.length) return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5">
          <p className="text-slate-500 text-sm">
            Energy data unavailable — ensure the /api/energy/hourly route returns
            [{"{"}hour: "06:00", kwh: 245, predicted: 230, temp: 29{"}"}...]
          </p>
        </div>
      )

      const toggleLine = (dataKey) => {
        setHiddenLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }))
      }

      return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium text-sm">24-hour energy trend</h3>
            <span className="text-slate-500 text-xs">Click legend to hide/show lines</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" strokeOpacity={0.4}/>
              <XAxis
                dataKey="hour"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="kwh"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={45}
              />
              <YAxis
                yAxisId="temp"
                orientation="right"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip content={<CustomTooltip />}/>
              <Legend
                wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
                onClick={(e) => toggleLine(e.dataKey)}
              />
              <Brush
                dataKey="hour"
                height={20}
                stroke="#334155"
                fill="#0F172A"
                travellerWidth={6}
              />
              <ReferenceLine yAxisId="kwh" y={0} stroke="#334155"/>
              <Bar
                yAxisId="kwh"
                dataKey="kwh"
                name="Actual (kWh)"
                fill="#3B82F6"
                fillOpacity={0.7}
                radius={[2,2,0,0]}
                isAnimationActive={true}
                animationDuration={800}
                hide={!!hiddenLines['kwh']}
              />
              <Line
                yAxisId="kwh"
                type="monotone"
                dataKey="predicted"
                name="Predicted (kWh)"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
                hide={!!hiddenLines['predicted']}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                name="Temp (°C)"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                isAnimationActive={true}
                animationDuration={1200}
                hide={!!hiddenLines['temp']}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )
    }
    ```
  </action>
  <verify>
    File exists at frontend/src/components/dashboard/EnergyLineChart.jsx
    Imports ComposedChart, Line, Bar, Brush, ReferenceLine from recharts
    Has CustomTooltip component with dark styling
    Has Legend with onClick toggle
    Has Brush for zoom
    Has temperature as dashed line on right Y axis
    Has SkeletonChart for loading state
    All Recharts series have isAnimationActive={true}
  </verify>
  <done>Interactive EnergyLineChart with temperature overlay, brush zoom, animated entry</done>
</task>
```

---

### Task 2.5 — Satellite campus map page

```xml
<task type="create">
  <n>Create interactive campus satellite map page</n>
  <files>frontend/src/app/campus/page.js</files>
  <action>
    Create frontend/src/app/campus/page.js.
    'use client' at top.

    PURPOSE: Satellite map of campus with colored energy markers, solar status bar,
    and an energy leaderboard sidebar showing all buildings ranked by consumption.

    Mapbox is imported DYNAMICALLY inside useEffect to avoid Next.js SSR crash.
    Never import mapbox-gl at the top of the file.

    === EXACT FILE CONTENT ===

    ```jsx
    'use client'
    import { useEffect, useState, useRef } from 'react'
    import { useFetch } from '@/lib/hooks'

    const CAMPUS_CENTER = [85.8252, 20.2961]

    const BUILDING_COORDS = {
      CSE:  [85.8268, 20.2972],
      ECE:  [85.8255, 20.2965],
      LIB:  [85.8245, 20.2960],
      ADM:  [85.8240, 20.2980],
      MEC:  [85.8275, 20.2955],
      HOS1: [85.8230, 20.2950],
      HOS2: [85.8228, 20.2945],
      CAF:  [85.8252, 20.2948],
      SPT:  [85.8285, 20.2940],
      SCI:  [85.8260, 20.2975],
    }

    function kwhToColor(kwh) {
      if (!kwh || kwh < 150) return '#10B981'
      if (kwh < 300)         return '#F59E0B'
      return '#EF4444'
    }
    function kwhLabel(kwh) {
      if (!kwh || kwh < 150) return 'Low'
      if (kwh < 300)         return 'Medium'
      return 'High'
    }

    function SolarBar({ solar }) {
      if (!solar) return null
      return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-[#1E293B]
                        border border-slate-700 rounded-xl px-5 py-3 text-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="live-indicator"/>
            <span className="text-slate-400">Solar</span>
            <span className="font-semibold text-white">{solar.irradiance_wm2} W/m²</span>
          </div>
          <div>
            <span className="text-slate-400">Cloud </span>
            <span className="font-semibold text-white">{solar.cloud_cover_pct}%</span>
          </div>
          <div>
            <span className="text-slate-400">Temp </span>
            <span className="font-semibold text-white">{solar.temp_c}°C</span>
          </div>
          <span className="ml-auto text-xs text-slate-500">
            Updated {solar.timestamp
              ? new Date(solar.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              : '—'}
          </span>
        </div>
      )
    }

    function Leaderboard({ buildings }) {
      if (!buildings?.length) return null
      const sorted = [...buildings].sort((a, b) => (b.consumption_kwh ?? 0) - (a.consumption_kwh ?? 0))
      return (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 animate-fadeIn">
          <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
            Energy leaderboard
          </h3>
          <div className="space-y-2">
            {sorted.map((b, i) => {
              const kwh = b.consumption_kwh ?? 0
              const max = sorted[0]?.consumption_kwh ?? 1
              const pct = Math.round((kwh / max) * 100)
              const color = kwhToColor(kwh)
              return (
                <div key={b.building_id} className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-4 text-right">{i + 1}</span>
                  <span className="text-slate-300 text-xs w-10 shrink-0">
                    {b.buildings?.code ?? '—'}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white w-14 text-right shrink-0">
                    {kwh.toFixed(0)} kWh
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    export default function CampusPage() {
      const mapRef         = useRef(null)
      const mapInstanceRef = useRef(null)
      const [mapboxReady, setMapboxReady] = useState(false)
      const { data, loading } = useFetch('/api/campus-map')

      const buildings = data?.buildings ?? []
      const solar     = data?.solar ?? null

      useEffect(() => {
        import('mapbox-gl').then(mod => {
          window._mapboxgl = mod.default
          const link = document.createElement('link')
          link.rel  = 'stylesheet'
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
          document.head.appendChild(link)
          setMapboxReady(true)
        })
      }, [])

      useEffect(() => {
        if (!mapboxReady || !buildings.length || !mapRef.current || mapInstanceRef.current) return
        const mapboxgl = window._mapboxgl
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: CAMPUS_CENTER,
          zoom: 16,
          pitch: 30,
          bearing: -10,
        })

        map.addControl(new mapboxgl.NavigationControl(), 'top-right')
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

        map.on('load', () => {
          buildings.forEach(b => {
            const code   = b.buildings?.code
            const coords = BUILDING_COORDS[code]
            if (!coords) return
            const kwh   = b.consumption_kwh
            const color = kwhToColor(kwh)
            const el    = document.createElement('div')
            el.style.cssText = [
              `background:${color}`, 'border:2.5px solid white',
              'border-radius:50%', 'width:16px', 'height:16px',
              `box-shadow:0 0 0 4px ${color}33`, 'cursor:pointer',
              'transition:transform .15s'
            ].join(';')
            el.onmouseenter = () => { el.style.transform = 'scale(1.4)' }
            el.onmouseleave = () => { el.style.transform = 'scale(1)' }

            new mapboxgl.Marker({ element: el })
              .setLngLat(coords)
              .setPopup(new mapboxgl.Popup({ offset: 18, closeButton: false })
                .setHTML(`
                  <div style="font-family:Inter,sans-serif;padding:4px 6px;min-width:150px">
                    <p style="font-weight:600;margin:0 0 2px;font-size:13px;color:#F1F5F9">
                      ${b.buildings?.name ?? code}
                    </p>
                    <p style="margin:0 0 6px;font-size:11px;color:#64748B;text-transform:capitalize">
                      ${b.buildings?.type ?? ''}
                    </p>
                    <hr style="border-color:#334155;margin:0 0 6px"/>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span style="font-size:13px;color:#F1F5F9">
                        ⚡ <strong>${kwh?.toFixed(1) ?? '—'} kWh</strong>
                      </span>
                      <span style="
                        background:${color}22;color:${color};
                        font-size:10px;padding:1px 7px;border-radius:999px
                      ">${kwhLabel(kwh)}</span>
                    </div>
                  </div>
                `))
              .addTo(map)
          })
        })

        mapInstanceRef.current = map
        return () => { map.remove(); mapInstanceRef.current = null }
      }, [mapboxReady, buildings])

      return (
        <div className="p-6 space-y-4 animate-fadeIn">
          <div>
            <h1 className="text-2xl font-semibold text-white">Campus map</h1>
            <p className="text-slate-400 text-sm mt-1">
              Live energy overlay on satellite imagery · hover markers for details
            </p>
          </div>

          <SolarBar solar={solar}/>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-700"
                 style={{ height: 500 }}>
              {loading && (
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-shimmer h-6 w-40 rounded"/>
                    <p className="text-slate-500 text-sm">Loading campus data…</p>
                  </div>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full"/>
            </div>

            <Leaderboard buildings={buildings}/>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-slate-400">
            {[
              { color: '#10B981', label: 'Low (<150 kWh)' },
              { color: '#F59E0B', label: 'Medium (150–300 kWh)' },
              { color: '#EF4444', label: 'High (>300 kWh)' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }}/>
                {label}
              </span>
            ))}
            <span className="text-slate-600 ml-auto">Click any marker for building detail</span>
          </div>
        </div>
      )
    }
    ```
  </action>
  <verify>
    File exists at frontend/src/app/campus/page.js
    mapbox-gl imported dynamically inside useEffect, NOT at top of file
    Has SolarBar, Leaderboard, map with colored markers
    useFetch from @/lib/hooks used (not raw useState + fetch)
    All buildings sorted by consumption in Leaderboard
    Markers have hover scale animation via onmouseenter/onmouseleave
  </verify>
  <done>Interactive campus satellite map with energy leaderboard sidebar</done>
</task>
```

---

## WAVE 3 — Update existing backend files (run after Wave 1 completes)

---

### Task 3.1 — Fix carbon factor and update prophet_model.py

```xml
<task type="edit">
  <n>Fix carbon factor and add weather regressors to prophet_model.py</n>
  <files>backend/app/services/carbon_calc.py, backend/app/models/prophet_model.py</files>
  <action>
    === EDIT 1: backend/app/services/carbon_calc.py ===

    Find this exact line (or similar constant):
      CO2_KG_PER_KWH = 0.82

    Replace it with:
      CO2_KG_PER_KWH = 0.727  # CEA v20.0 FY2023-24 India grid (updated Dec 2024)

    If the constant is named differently (e.g. EMISSION_FACTOR, CARBON_FACTOR),
    update whatever name is used — just change the value to 0.727.

    === EDIT 2: backend/app/models/prophet_model.py — APPEND to end ===

    Do NOT modify existing code. Append these functions after all existing content:

    ```python
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
    ```
  </action>
  <verify>
    carbon_calc.py has CO2_KG_PER_KWH = 0.727
    prophet_model.py contains train_with_weather, predict_with_weather, load_trained_model
    Existing functions in prophet_model.py are untouched
    No syntax errors: python -m py_compile backend/app/models/prophet_model.py
  </verify>
  <done>Carbon factor corrected to CEA v20.0 value, weather regressor functions added</done>
</task>
```

---

### Task 3.2 — Register all routers in main.py

```xml
<task type="edit">
  <n>Register real_data router in FastAPI main.py</n>
  <files>backend/app/main.py</files>
  <action>
    Edit backend/app/main.py.

    Step 1 — Find the line that imports routers. It currently looks like:
      from routers import predictions, anomalies, recommendations, simulation
    Change it to include real_data (add it at the end of the import):
      from routers import predictions, anomalies, recommendations, simulation, real_data

    Step 2 — Find the block of app.include_router() calls.
    After the last existing one, add on a new line:
      app.include_router(real_data.router)

    Do not change any other line in main.py.
  </action>
  <verify>
    real_data present in the routers import line
    app.include_router(real_data.router) is present
    python -c "import sys; sys.path.insert(0,'backend/app'); from main import app; print('OK')" runs without error
  </verify>
  <done>real_data router registered in FastAPI</done>
</task>
```

---

### Task 3.3 — Update dashboard home page with new cards

```xml
<task type="edit">
  <n>Add SolarCard and AQICard to dashboard home page</n>
  <files>frontend/src/app/page.js</files>
  <action>
    Edit frontend/src/app/page.js.

    Step 1 — Add these two imports near the top, after existing component imports:
      import SolarCard from '@/components/dashboard/SolarCard'
      import AQICard   from '@/components/dashboard/AQICard'

    Step 2 — Find the summary cards grid. It has SummaryCard components for
    Total Energy, Waste, Carbon, Savings, Sustainability Score.
    After the LAST existing SummaryCard, add:
      <SolarCard />
      <AQICard />

    Do not remove any existing cards. Do not change anything else.
  </action>
  <verify>
    Both imports present at top of page.js
    <SolarCard /> and <AQICard /> inside the cards grid
    All existing SummaryCard components still present
  </verify>
  <done>SolarCard and AQICard added to dashboard home page</done>
</task>
```

---

### Task 3.4 — Add EnergyLineChart to dashboard

```xml
<task type="edit">
  <n>Replace or enhance EnergyLineChart in dashboard home page</n>
  <files>frontend/src/app/page.js</files>
  <action>
    Edit frontend/src/app/page.js.

    Find where the existing energy line chart component is rendered in the charts section.
    It may be rendered as <EnergyLineChart/> or similar.

    If the existing import says something like:
      import EnergyLineChart from '@/components/dashboard/EnergyLineChart'
    The import is already correct (we replaced the component in Task 2.4).

    If there is no EnergyLineChart import yet, add this import:
      import EnergyLineChart from '@/components/dashboard/EnergyLineChart'

    And add this in the charts section:
      <EnergyLineChart buildingCode="ALL" />

    Do not duplicate it if it is already rendered.
    Do not change any other part of the file.
  </action>
  <verify>
    EnergyLineChart imported from @/components/dashboard/EnergyLineChart
    <EnergyLineChart buildingCode="ALL" /> rendered in charts section
  </verify>
  <done>Interactive EnergyLineChart wired into dashboard home page</done>
</task>
```

---

### Task 3.5 — Add Campus Map to sidebar

```xml
<task type="edit">
  <n>Add Campus Map link to Sidebar</n>
  <files>frontend/src/components/layout/Sidebar.jsx</files>
  <action>
    Edit frontend/src/components/layout/Sidebar.jsx.

    Find the nav links array or JSX block. It has entries for:
      Dashboard, Energy, Waste, Predictions, Recommendations, Reports

    Add a Campus Map entry. Match the EXACT pattern of existing nav items.

    If existing items are objects like { href: '/energy', label: 'Energy', icon: ... }:
      Add: { href: '/campus', label: 'Campus Map', icon: '🛰️' }

    If existing items are JSX <Link> elements directly:
      Add a new <Link href="/campus"> element matching the same className and structure
      as the other items, with label text "Campus Map" and icon '🛰️'.

    Place it between Recommendations and Reports in the list order.
    Do not change any other nav items.
  </action>
  <verify>
    Sidebar.jsx has a link to /campus with label "Campus Map"
    All existing nav links are still present and in correct order
  </verify>
  <done>Campus Map added to sidebar navigation</done>
</task>
```

---

## WAVE 4 — Dependencies and environment (final wave)

---

### Task 4.1 — Install all frontend deps

```xml
<task type="shell">
  <n>Install frontend dependencies</n>
  <files>frontend/package.json</files>
  <action>
    Run from the project root directory e:\WorkSpace\Appathon\:
      cd frontend && npm install mapbox-gl

    Verify recharts is already installed. If not, also run:
      npm install recharts

    Both packages must appear in frontend/package.json under "dependencies".
  </action>
  <verify>
    frontend/package.json has "mapbox-gl" under dependencies
    frontend/package.json has "recharts" under dependencies
    frontend/node_modules/mapbox-gl exists
  </verify>
  <done>mapbox-gl and recharts installed</done>
</task>
```

---

### Task 4.2 — Update backend requirements and env vars

```xml
<task type="edit">
  <n>Update requirements.txt and .env.local with all new vars</n>
  <files>backend/requirements.txt, .env.local</files>
  <action>
    === EDIT 1: backend/requirements.txt ===
    Ensure these packages are present (add any that are missing, do not duplicate):
      httpx>=0.27.0
      prophet>=1.1.4
      scikit-learn>=1.4.0
      pandas>=2.0.0
      numpy>=1.26.0

    === EDIT 2: .env.local (frontend root) ===
    Append these lines at the END of the file.
    Do NOT modify any existing lines. Only add lines that are not already present:

    # --- Satellite & real-data integration ---
    NEXT_PUBLIC_MAPBOX_TOKEN=REPLACE_WITH_FREE_TOKEN_FROM_account.mapbox.com
    SUPABASE_SERVICE_KEY=REPLACE_WITH_SERVICE_ROLE_KEY_FROM_supabase_dashboard_settings_api

    === EDIT 3: backend/.env (or backend/app/config.py if that is how env is loaded) ===
    Add these to the backend environment configuration:
      DATA_GOV_IN_KEY=REPLACE_WITH_FREE_KEY_FROM_data.gov.in
      CAMPUS_LAT=20.2961
      CAMPUS_LON=85.8245
  </action>
  <verify>
    httpx present in backend/requirements.txt
    NEXT_PUBLIC_MAPBOX_TOKEN present in .env.local
    SUPABASE_SERVICE_KEY present in .env.local
    DATA_GOV_IN_KEY present in backend env config
    No existing env values were changed
  </verify>
  <done>All dependencies and env vars updated</done>
</task>
```

---

## POST-IMPLEMENTATION CHECKLIST (do this manually after Gemini finishes)

```
□ 1. Open .env.local — replace NEXT_PUBLIC_MAPBOX_TOKEN with real token
      → https://account.mapbox.com (sign up free, Tokens tab, "Create a token")

□ 2. Open .env.local — replace SUPABASE_SERVICE_KEY with service_role key
      → Supabase dashboard → Settings → API → service_role (long key, starts with eyJ...)

□ 3. Open backend/.env — replace DATA_GOV_IN_KEY with real key
      → https://data.gov.in/user/register (free, instant API key on profile page)

□ 4. Update BUILDING_COORDS in frontend/src/app/campus/page.js
      → Replace [85.xxx, 20.xxx] with actual GPS coords of each campus building
      → Use Google Maps right-click → "Copy coordinates" for each building

□ 5. Download I-BLEND dataset (optional but improves model accuracy)
      → https://doi.org/10.6084/m9.figshare.c.3893581.v1
      → Extract CSV files to backend/data/iblend/
      → Run: python backend/data/calibrate_from_iblend.py

□ 6. Seed real weather data
      → Run: python backend/data/seed_real_weather.py
      → Takes ~30s, saves real 6-month hourly weather to backend/data/real_weather.json

□ 7. Train the model with real data
      → Run: python backend/data/train_model.py
      → Saves model to backend/trained_models/prophet_with_weather.pkl
      → Check MAPE output — target is < 10%

□ 8. Start both servers and test
      → cd backend && uvicorn app.main:app --reload
      → cd frontend && npm run dev
      → Open http://localhost:3000/campus — satellite map should load
      → Dashboard solar card should show live value with animated count-up
      → AQI card shows "Unavailable" if DATA_GOV_IN_KEY not set yet (that's fine)
```

---

## ALL FILES TOUCHED — SUMMARY

| Wave | Action | File |
|------|--------|------|
| 1 | CREATE | `backend/app/services/real_data_service.py` |
| 1 | CREATE | `backend/data/calibrate_from_iblend.py` |
| 1 | CREATE | `backend/data/seed_real_weather.py` |
| 1 | CREATE | `backend/data/train_model.py` |
| 1 | CREATE | `backend/app/routers/real_data.py` |
| 1 | CREATE | `frontend/src/app/api/solar/route.js` |
| 1 | CREATE | `frontend/src/app/api/aqi/route.js` |
| 1 | CREATE | `frontend/src/app/api/campus-map/route.js` |
| 1 | CREATE | `frontend/src/app/api/sunrise/route.js` |
| 2 | CREATE | `frontend/src/lib/hooks.js` |
| 2 | EDIT   | `frontend/src/styles/globals.css` (append animations) |
| 2 | CREATE | `frontend/src/components/dashboard/SolarCard.jsx` |
| 2 | CREATE | `frontend/src/components/dashboard/AQICard.jsx` |
| 2 | REPLACE| `frontend/src/components/dashboard/EnergyLineChart.jsx` |
| 2 | CREATE | `frontend/src/app/campus/page.js` |
| 3 | EDIT   | `backend/app/services/carbon_calc.py` (0.82 → 0.727) |
| 3 | EDIT   | `backend/app/models/prophet_model.py` (append 3 functions) |
| 3 | EDIT   | `backend/app/main.py` (register real_data router) |
| 3 | EDIT   | `frontend/src/app/page.js` (add SolarCard, AQICard, EnergyLineChart) |
| 3 | EDIT   | `frontend/src/components/layout/Sidebar.jsx` (add Campus Map) |
| 4 | EDIT   | `backend/requirements.txt` |
| 4 | EDIT   | `.env.local` |
| 4 | EDIT   | `backend/.env` |
| 4 | SHELL  | `npm install mapbox-gl` in frontend/ |
