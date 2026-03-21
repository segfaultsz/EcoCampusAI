"""
Truncate tables to allow clean reseeding
"""
import httpx
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# Tables to truncate (in order to avoid FK issues)
tables = [
    "energy_readings",
    "waste_records",
    "anomalies",
    "recommendations",
    "carbon_footprint"
]

with httpx.Client() as client:
    for table in tables:
        sql = f"TRUNCATE TABLE {table} CASCADE;"
        resp = client.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            json={"query": sql},
            headers=headers,
        )
        if resp.status_code in (200, 204):
            print(f"[OK] Truncated {table}")
        else:
            print(f"[ERR] {table}: {resp.status_code} {resp.text}")

print("\nAll tables truncated. Ready for clean reseed.")
