# EcoCampus AI — Walkthrough (Heavy-Lifting Complete)

## What Was Built

### 1. Supabase Database (7 tables, 9 indexes)
- [buildings](file:///e:/WorkSpace/Appathon/backend/app/services/data_service.py#35-38) — 10 campus buildings with metadata
- [energy_readings](file:///e:/WorkSpace/Appathon/backend/app/services/data_service.py#46-67) — 43,440 hourly consumption records (6 months)
- [waste_records](file:///e:/WorkSpace/Appathon/backend/app/services/data_service.py#69-84) — 1,810 daily waste entries
- [anomalies](file:///e:/WorkSpace/Appathon/backend/data/seed_database.py#92-102) — 19 injected anomaly events
- [recommendations](file:///e:/WorkSpace/Appathon/backend/data/seed_database.py#104-111) — 59 pre-seeded optimization suggestions
- `carbon_footprint` — 181 daily CO₂ records
- [predictions](file:///e:/WorkSpace/Appathon/backend/app/services/data_service.py#102-112) — ready for ML output

### 2. Synthetic Data Generator
[generate_synthetic.py](file:///e:/WorkSpace/Appathon/backend/data/generate_synthetic.py) generates realistic campus data with:
- **Per-building hourly profiles** — different patterns for academic, hostel, admin, lab, amenity
- **Seasonality** — summer AC boost (+25%), winter dip (-10%), exam periods (+15%), semester breaks (-40%)
- **Anomaly injection** — ~2% daily chance per building, with severity classification
- **Waste profiles** — organic/recyclable/e-waste/general per building type

### 3. ML Models (3 modules)

| Model | File | Purpose |
|-------|------|---------|
| Energy Forecaster | [prophet_model.py](file:///e:/WorkSpace/Appathon/backend/app/models/prophet_model.py) | 7-day energy prediction with confidence intervals |
| Anomaly Detector | [anomaly_model.py](file:///e:/WorkSpace/Appathon/backend/app/models/anomaly_model.py) | Isolation Forest anomaly detection with explanations |
| Recommender | [recommender.py](file:///e:/WorkSpace/Appathon/backend/app/models/recommender.py) | Rule-based optimization + what-if simulator |

### 4. FastAPI Backend (12 endpoints)
[main.py](file:///e:/WorkSpace/Appathon/backend/app/main.py) serves:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/model/status` | GET | Loaded model counts |
| `/train/all` | POST | Train all buildings |
| `/train/{building_id}` | POST | Train single building |
| `/predict/energy` | POST | 7-day forecast |
| `/predict/peak` | POST | Peak detection |
| `/detect/anomalies` | POST | Anomaly scan |
| `/recommend` | POST | Generate recommendations |
| `/simulate` | POST | What-if scenario |
| `/carbon/equivalences/{co2}` | GET | Carbon equivalences |
| `/sustainability/score/{id}` | GET | Sustainability rating |

## Verification Results

- ✅ Server starts on `http://localhost:8000`
- ✅ Training completes for all 10 buildings
- ✅ Prediction returns forecasts with confidence bounds
- ✅ Simulation returns savings analysis
- ✅ Database contains 43,440+ records across all tables

## How to Run

```bash
cd e:\WorkSpace\Appathon\backend
.\venv\Scripts\python -m app.main
# Server starts at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

> **Note:** Prophet isn't installed (needs C++ build tools on Windows). The fallback statistical model works well for the demo. If you need Prophet, install Visual Studio Build Tools with C++ workload, then `pip install prophet`.
