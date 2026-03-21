"""
EcoCampus AI - Seed Database
==============================
Reads generated CSV files and pushes data to Supabase in batches.
Handles building ID mapping (CSV uses codes like LHC, GAL, etc., Supabase uses UUIDs).
"""

import os
import sys
import pandas as pd
import httpx
from dotenv import load_dotenv

# Load env from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
DATA_DIR = os.path.join(os.path.dirname(__file__))

BATCH_SIZE = 500  # Supabase insert batch size

def get_headers():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
        sys.exit(1)
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def clear_tables():
    """Delete all data from all tables (respecting FK order)."""
    headers = get_headers()
    # Delete in reverse dependency order
    tables = [
        "energy_readings",
        "waste_records", 
        "anomalies",
        "recommendations",
        "carbon_footprint",
        "buildings"  # Last due to FK references
    ]
    print("\n[0/6] Clearing existing data...")
    for table in tables:
        # Using DELETE without filter clears all rows
        resp = httpx.delete(f"{SUPABASE_URL}/rest/v1/{table}", headers=headers)
        if resp.status_code in (200, 204):
            print(f"  Cleared {table}")
        else:
            print(f"  Warning: {table} clear returned {resp.status_code}")


def seed_buildings() -> dict:
    """Insert buildings and return code→UUID mapping."""
    print("\n[1/6] Seeding buildings...")
    headers = get_headers()
    
    # Task 2: Handle existing buildings
    get_resp = httpx.get(f"{SUPABASE_URL}/rest/v1/buildings?select=id,code", headers=headers)
    get_resp.raise_for_status()
    existing_data = get_resp.json()
    
    if len(existing_data) >= 11:
        print("  Buildings already exist, using existing IDs")
        return {r["code"]: r["id"] for r in existing_data}
        
    df = pd.read_csv(os.path.join(DATA_DIR, "buildings.csv"))
    records = df.to_dict("records")

    # Convert has_ac from numpy bool to Python bool
    for r in records:
        r["has_ac"] = bool(r["has_ac"])

    resp = httpx.post(f"{SUPABASE_URL}/rest/v1/buildings", json=records, headers=headers)
    resp.raise_for_status()
    
    # Build code → id mapping
    mapping = {}
    for row in resp.json():
        mapping[row["code"]] = row["id"]
    
    print(f"  Inserted {len(resp.json())} buildings")
    return mapping


def seed_in_batches(table: str, records: list[dict], label: str):
    """Insert records in batches to avoid payload limits."""
    headers = get_headers()
    
    total = len(records)
    inserted = 0
    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        resp = httpx.post(f"{SUPABASE_URL}/rest/v1/{table}", json=batch, headers=headers)
        if resp.status_code not in (200, 201):
            print(f"\n  Error inserting {table}: {resp.text}")
            resp.raise_for_status()
            
        inserted += len(batch)
        pct = (inserted / total) * 100
        print(f"  Progress: {inserted:,}/{total:,} ({pct:.0f}%)", end="\r")
    print(f"  Inserted {total:,} {label}" + " " * 20)


def seed_energy(id_map: dict):
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
    
    seed_in_batches("energy_readings", records, "energy readings")


def seed_waste(id_map: dict):
    """Seed waste_records table."""
    print("\n[3/6] Seeding waste records...")
    df = pd.read_csv(os.path.join(DATA_DIR, "waste_records.csv"))
    df["building_id"] = df["building_id"].map(id_map)
    records = df.to_dict("records")
    seed_in_batches("waste_records", records, "waste records")


def seed_anomalies(id_map: dict):
    """Seed anomalies table."""
    print("\n[4/6] Seeding anomalies...")
    df = pd.read_csv(os.path.join(DATA_DIR, "anomalies.csv"))
    df["building_id"] = df["building_id"].map(id_map)
    df["is_resolved"] = df["is_resolved"].astype(bool)
    records = df.to_dict("records")
    for r in records:
        r["is_resolved"] = bool(r["is_resolved"])
    seed_in_batches("anomalies", records, "anomalies")


def seed_recommendations(id_map: dict):
    """Seed recommendations table."""
    print("\n[5/6] Seeding recommendations...")
    df = pd.read_csv(os.path.join(DATA_DIR, "recommendations.csv"))
    df["building_id"] = df["building_id"].map(id_map)
    records = df.to_dict("records")
    seed_in_batches("recommendations", records, "recommendations")


def seed_carbon():
    """Seed carbon_footprint table with upsert to handle duplicates."""
    print("\n[6/6] Seeding carbon footprint...")
    df = pd.read_csv(os.path.join(DATA_DIR, "carbon_footprint.csv"))
    records = df.to_dict("records")
    
    # Use upsert via POST with on_conflict query param
    headers = get_headers()
    
    total = len(records)
    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        # Use POST with on_conflict=date to upsert
        url = f"{SUPABASE_URL}/rest/v1/carbon_footprint?on_conflict=date"
        resp = httpx.post(url, json=batch, headers=headers)
        if resp.status_code not in (200, 201, 204):
            print(f"\n  Error upserting carbon_footprint: {resp.status_code} {resp.text}")
            resp.raise_for_status()
            
    print(f"  Inserted/updated {total:,} carbon records" + " " * 20)


def main():
    # Check that CSVs exist
    required = ["buildings.csv", "energy_readings.csv", "waste_records.csv",
                 "anomalies.csv", "recommendations.csv", "carbon_footprint.csv"]
    missing = [f for f in required if not os.path.exists(os.path.join(DATA_DIR, f))]
    if missing:
        print(f"ERROR: Missing CSV files: {missing}")
        print("Run generate_synthetic.py first!")
        sys.exit(1)

    print("=" * 60)
    print("EcoCampus AI - Database Seeder")
    print("=" * 60)

    # Clear existing data to avoid duplicates
    clear_tables()
    
    # Seed in order (buildings first for FK references)
    id_map = seed_buildings()
    seed_energy(id_map)
    seed_waste(id_map)
    seed_anomalies(id_map)
    seed_recommendations(id_map)
    seed_carbon()

    print("\n" + "=" * 60)
    print("DATABASE SEEDED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    main()
