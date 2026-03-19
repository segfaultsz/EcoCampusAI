"""
EcoCampus AI - Seed Database
==============================
Reads generated CSV files and pushes data to Supabase in batches.
Handles building ID mapping (CSV uses codes like LHC, GAL, etc., Supabase uses UUIDs).
"""

import os
import sys
import pandas as pd
from supabase import create_client
from dotenv import load_dotenv

# Load env from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
DATA_DIR = os.path.join(os.path.dirname(__file__))

BATCH_SIZE = 500  # Supabase insert batch size


def get_client():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def seed_buildings(client) -> dict:
    """Insert buildings and return code→UUID mapping."""
    print("\n[1/6] Seeding buildings...")
    df = pd.read_csv(os.path.join(DATA_DIR, "buildings.csv"))
    records = df.to_dict("records")

    # Convert has_ac from numpy bool to Python bool
    for r in records:
        r["has_ac"] = bool(r["has_ac"])

    result = client.table("buildings").insert(records).execute()
    
    # Build code → id mapping
    mapping = {}
    for row in result.data:
        mapping[row["code"]] = row["id"]
    
    print(f"  Inserted {len(result.data)} buildings")
    return mapping


def seed_in_batches(client, table: str, records: list[dict], label: str):
    """Insert records in batches to avoid payload limits."""
    total = len(records)
    inserted = 0
    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        client.table(table).insert(batch).execute()
        inserted += len(batch)
        pct = (inserted / total) * 100
        print(f"  Progress: {inserted:,}/{total:,} ({pct:.0f}%)", end="\r")
    print(f"  Inserted {total:,} {label}" + " " * 20)


def seed_energy(client, id_map: dict):
    """Seed energy_readings table."""
    print("\n[2/6] Seeding energy readings (this will take a while)...")
    df = pd.read_csv(os.path.join(DATA_DIR, "energy_readings.csv"))
    
    # Replace building code with UUID
    df["building_id"] = df["building_id"].map(id_map)
    
    # Convert booleans
    df["is_peak_hour"] = df["is_peak_hour"].astype(bool)
    
    records = df.to_dict("records")
    for r in records:
        r["is_peak_hour"] = bool(r["is_peak_hour"])
    
    seed_in_batches(client, "energy_readings", records, "energy readings")


def seed_waste(client, id_map: dict):
    """Seed waste_records table."""
    print("\n[3/6] Seeding waste records...")
    df = pd.read_csv(os.path.join(DATA_DIR, "waste_records.csv"))
    df["building_id"] = df["building_id"].map(id_map)
    records = df.to_dict("records")
    seed_in_batches(client, "waste_records", records, "waste records")


def seed_anomalies(client, id_map: dict):
    """Seed anomalies table."""
    print("\n[4/6] Seeding anomalies...")
    df = pd.read_csv(os.path.join(DATA_DIR, "anomalies.csv"))
    df["building_id"] = df["building_id"].map(id_map)
    df["is_resolved"] = df["is_resolved"].astype(bool)
    records = df.to_dict("records")
    for r in records:
        r["is_resolved"] = bool(r["is_resolved"])
    seed_in_batches(client, "anomalies", records, "anomalies")


def seed_recommendations(client, id_map: dict):
    """Seed recommendations table."""
    print("\n[5/6] Seeding recommendations...")
    df = pd.read_csv(os.path.join(DATA_DIR, "recommendations.csv"))
    df["building_id"] = df["building_id"].map(id_map)
    records = df.to_dict("records")
    seed_in_batches(client, "recommendations", records, "recommendations")


def seed_carbon(client):
    """Seed carbon_footprint table."""
    print("\n[6/6] Seeding carbon footprint...")
    df = pd.read_csv(os.path.join(DATA_DIR, "carbon_footprint.csv"))
    records = df.to_dict("records")
    seed_in_batches(client, "carbon_footprint", records, "carbon records")


def main():
    # Check that CSVs exist
    required = ["buildings.csv", "energy_readings.csv", "waste_records.csv",
                 "anomalies.csv", "recommendations.csv", "carbon_footprint.csv"]
    missing = [f for f in required if not os.path.exists(os.path.join(DATA_DIR, f))]
    if missing:
        print(f"ERROR: Missing CSV files: {missing}")
        print("Run generate_synthetic.py first!")
        sys.exit(1)

    client = get_client()

    print("=" * 60)
    print("EcoCampus AI - Database Seeder")
    print("=" * 60)

    # Seed in order (buildings first for FK references)
    id_map = seed_buildings(client)
    seed_energy(client, id_map)
    seed_waste(client, id_map)
    seed_anomalies(client, id_map)
    seed_recommendations(client, id_map)
    seed_carbon(client)

    print("\n" + "=" * 60)
    print("DATABASE SEEDED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    main()
