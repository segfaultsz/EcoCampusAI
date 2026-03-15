# EcoCampus AI — Supabase Schema Setup
## For Antigravity (Supabase MCP) — OR just use the free Supabase Dashboard

---

## ⚠️ CREDIT-SAVING NOTE — Read this first

**You don't need Antigravity credits for this file at all.**

The Supabase SQL Editor is completely free. Go to:
`https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`

Paste each SQL block below and click "Run". Done. Zero credits spent.

**Only use Antigravity MCP if you want to run this hands-free as part of an automated flow.**

### Cheaper Alternatives to Antigravity
| Option | Cost | How |
|--------|------|-----|
| Supabase dashboard SQL editor | Free | Paste SQL, click Run |
| Supabase CLI (`supabase db push`) | Free | Local migration files |
| Claude.ai with Supabase MCP | Uses Claude.ai credits (cheaper) | Same MCP, different host |
| psql direct connection | Free | Supabase → Settings → Database → Connection string |

---

## SQL Block 1 — Create `solar_readings` table

```sql
CREATE TABLE IF NOT EXISTS solar_readings (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp        TIMESTAMPTZ NOT NULL UNIQUE,
  irradiance_wm2   DECIMAL(8,2),
  cloud_cover_pct  INTEGER,
  temp_c           DECIMAL(5,2),
  source           VARCHAR(20) DEFAULT 'open-meteo',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solar_time
  ON solar_readings(timestamp DESC);
```

---

## SQL Block 2 — Create `aqi_readings` table (new)

```sql
CREATE TABLE IF NOT EXISTS aqi_readings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp     TIMESTAMPTZ NOT NULL UNIQUE,
  aqi           INTEGER,
  pm25          DECIMAL(6,2),
  pm10          DECIMAL(6,2),
  station_name  VARCHAR(100),
  source        VARCHAR(20) DEFAULT 'cpcb',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aqi_time
  ON aqi_readings(timestamp DESC);
```

---

## SQL Block 3 — Update carbon factor constant (critical fix)

The current mock generator uses 0.82 kg/kWh. CEA v20.0 (Dec 2024) specifies 0.727 for FY2023-24.
This SQL stores it as a config row so the backend can read it without a code deploy:

```sql
CREATE TABLE IF NOT EXISTS app_config (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  note  TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_config (key, value, note)
VALUES
  ('co2_kg_per_kwh',   '0.727', 'CEA v20.0 FY2023-24 India grid emission factor'),
  ('currency_symbol',  '₹',     'Display currency'),
  ('campus_lat',       '20.2961', 'Campus latitude — update with real value'),
  ('campus_lon',       '85.8245', 'Campus longitude — update with real value'),
  ('tariff_rs_per_kwh','7.50',  'CESU Odisha LT-3 commercial rate — verify current slab')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      note = EXCLUDED.note,
      updated_at = NOW();
```

---

## SQL Block 4 — Add `is_daylight` column to energy_readings

This lets the anomaly detector flag lights/AC running after sunset without a code change:

```sql
ALTER TABLE energy_readings
  ADD COLUMN IF NOT EXISTS is_daylight BOOLEAN DEFAULT true;

COMMENT ON COLUMN energy_readings.is_daylight IS
  'True if reading falls between local sunrise and sunset. Populated by backend.';
```

---

## SQL Block 5 — Verify everything

Run this to confirm all tables exist with correct columns:

```sql
SELECT
  t.table_name,
  COUNT(c.column_name) AS column_count
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_name = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN (
    'solar_readings', 'aqi_readings', 'app_config',
    'energy_readings', 'buildings', 'predictions',
    'anomalies', 'recommendations', 'waste_records'
  )
GROUP BY t.table_name
ORDER BY t.table_name;
```

Expected output — every listed table should appear with column_count > 0.

---

## SQL Block 6 — Seed test data (optional, delete after verifying)

```sql
-- Test solar row
INSERT INTO solar_readings (timestamp, irradiance_wm2, cloud_cover_pct, temp_c, source)
VALUES (NOW(), 512.3, 18, 31.5, 'test')
ON CONFLICT (timestamp) DO NOTHING;

-- Test AQI row
INSERT INTO aqi_readings (timestamp, aqi, pm25, pm10, station_name, source)
VALUES (NOW(), 87, 42.1, 68.5, 'Bhubaneswar CPCB', 'test')
ON CONFLICT (timestamp) DO NOTHING;

-- Verify
SELECT 'solar_readings' AS tbl, COUNT(*) FROM solar_readings
UNION ALL
SELECT 'aqi_readings', COUNT(*) FROM aqi_readings
UNION ALL
SELECT 'app_config', COUNT(*) FROM app_config;

-- Clean up test rows
DELETE FROM solar_readings WHERE source = 'test';
DELETE FROM aqi_readings   WHERE source = 'test';
```

---

## Done

Once all 5 blocks run without errors, the database is ready.
Hand the Gemini GSD file to Gemini CLI next.
