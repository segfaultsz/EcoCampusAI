"""Application configuration loaded from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
MODEL_PATH = os.getenv("MODEL_PATH", "./trained_models/")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("WARNING: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
