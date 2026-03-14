"""
EcoCampus AI - Lightweight REST Seeder
========================================
Seeds Supabase using direct REST API calls via httpx.
No C++ build dependencies required.
"""

import os
import sys
import json
import math
import httpx
import pandas as pd
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
DATA_DIR = os.path.dirname(__file__)

BATCH_SIZE = 300  # rows per REST call
TIMEOUT = 30.0

# Building code → UUID mapping (from INSERT RETURNING)
BUILDING_MAP = {
    "CSE": "85e948f0-8c9e-4be4-afe2-06be69b9e635",
    "ECE": "5e3e6507-27b4-4f58-a8c8-80de67575121",
    "LIB": "6ed48a04-6ebb-43c8-a4c0-7854c23f0855",
    "ADM": "e8866a95-150f-428c-af69-3023627fd13d",
    "MEC": "a259070d-2206-461b-8332-7a105dfcc929",
    "HOS1": "b70fc0df-d667-4950-864e-fabee1445f97",
    "HOS2": "5cfe195b-6947-4727-abd3-238470d67883",
    "CAF": "4adb8301-72b5-48f3-a2f7-4c176a6f6df9",
    "SPT": "81b5dc09-a0d6-4527-a322-f411ea08e51c",
    "SCI": "28bdf1f3-c086-4300-839e-a31b07501278",
}

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


def post_batch(client: httpx.Client, table: str, records: list[dict]):
    """POST a batch of records to Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    resp = client.post(url, json=records, headers=HEADERS, timeout=TIMEOUT)
    if resp.status_code not in (200, 201, 206):
        print(f"\n  ERROR: {resp.status_code} - {resp.text[:200]}")
        raise Exception(f"Failed to insert into {table}")


def seed_table(client: httpx.Client, table: str, csv_file: str, transform_fn=None):
    """Read CSV, optionally transform, and insert in batches."""
    filepath = os.path.join(DATA_DIR, csv_file)
    df = pd.read_csv(filepath)

    if transform_fn:
        df = transform_fn(df)

    records = df.to_dict("records")
    total = len(records)
    batches = math.ceil(total / BATCH_SIZE)

    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]

        # Clean NaN/inf values
        for rec in batch:
            for k, v in rec.items():
                if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                    rec[k] = 0.0
                elif isinstance(v, bool):
                    rec[k] = bool(v)

        post_batch(client, table, batch)
        done = min(i + BATCH_SIZE, total)
        pct = (done / total) * 100
        print(f"  [{done:,}/{total:,}] ({pct:.0f}%)", end="\r")

    print(f"  Inserted {total:,} records into {table}" + " " * 20)


def transform_energy(df: pd.DataFrame) -> pd.DataFrame:
    df["building_id"] = df["building_id"].map(BUILDING_MAP)
    df["is_peak_hour"] = df["is_peak_hour"].apply(lambda x: bool(x))
    # Drop the created_at column if present (let DB handle it)
    if "created_at" in df.columns:
        df.drop("created_at", axis=1, inplace=True)
    return df


def transform_waste(df: pd.DataFrame) -> pd.DataFrame:
    df["building_id"] = df["building_id"].map(BUILDING_MAP)
    if "created_at" in df.columns:
        df.drop("created_at", axis=1, inplace=True)
    return df


def transform_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    df["building_id"] = df["building_id"].map(BUILDING_MAP)
    df["is_resolved"] = df["is_resolved"].apply(lambda x: bool(x))
    if "created_at" in df.columns:
        df.drop("created_at", axis=1, inplace=True)
    return df


def transform_recommendations(df: pd.DataFrame) -> pd.DataFrame:
    df["building_id"] = df["building_id"].map(BUILDING_MAP)
    if "created_at" in df.columns:
        df.drop("created_at", axis=1, inplace=True)
    return df


def transform_carbon(df: pd.DataFrame) -> pd.DataFrame:
    if "created_at" in df.columns:
        df.drop("created_at", axis=1, inplace=True)
    return df


def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
        sys.exit(1)

    print("=" * 60)
    print("EcoCampus AI - REST API Database Seeder")
    print("=" * 60)

    with httpx.Client() as client:
        # Test connection
        print("\nTesting connection...")
        resp = client.get(
            f"{SUPABASE_URL}/rest/v1/buildings?select=count",
            headers={**HEADERS, "Prefer": "count=exact"},
            timeout=TIMEOUT,
        )
        if resp.status_code in (200, 206):
            print("  Connected to Supabase ✓")
        else:
            print(f"  Connection failed: {resp.status_code}")
            sys.exit(1)

        print("\n[1/5] Seeding energy readings (largest table)...")
        seed_table(client, "energy_readings", "energy_readings.csv", transform_energy)

        print("\n[2/5] Seeding waste records...")
        seed_table(client, "waste_records", "waste_records.csv", transform_waste)

        print("\n[3/5] Seeding anomalies...")
        seed_table(client, "anomalies", "anomalies.csv", transform_anomalies)

        print("\n[4/5] Seeding recommendations...")
        seed_table(client, "recommendations", "recommendations.csv", transform_recommendations)

        print("\n[5/5] Seeding carbon footprint...")
        seed_table(client, "carbon_footprint", "carbon_footprint.csv", transform_carbon)

    print("\n" + "=" * 60)
    print("DATABASE SEEDED SUCCESSFULLY! ✓")
    print("=" * 60)


if __name__ == "__main__":
    main()
