# Phase 08: Data Availability Fixes - Context

**Phase Boundary:** Fix Energy Data and Air Quality (AQI) data availability on the frontend.

**Goal:**
1. Implement a backend hourly energy statistics endpoint for the Dashboard and Energy charts.
2. Fix AQI data retrieval (external API connection) and remove "check DATA_GOV_IN_KEY" errors.

**Affected Files:**
- `backend/app/routers/real_data.py`: Add `/api/real/energy/hourly` endpoint.
- `backend/app/services/data_service.py`: Add `get_hourly_stats` aggregation logic.
- `backend/app/services/real_data_service.py`: Fix AQI fetching logic.
- `frontend/src/app/api/energy/hourly/route.js`: Create Next.js proxy route.
- `backend/.env`: Document required keys.

**Technical Constraints:**
- Return data in the format `[{hour: "HH:00", kwh: number, predicted: number, temp: number}, ...]`.
- Ensure fallback behavior if external APIs fail or keys are missing.
- Use current `building` code (e.g., 'ALL', 'CSE') to filter results.
