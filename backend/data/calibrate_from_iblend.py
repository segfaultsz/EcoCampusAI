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