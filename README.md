<div align="center">

# 🌿 EcoCampus AI

**Smart Campus Sustainability Optimization Dashboard**

*AI-driven insights to reduce energy consumption, optimize waste management, and lower carbon footprint across campus buildings.*

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)

</div>

---

## Overview

EcoCampus AI is a full-stack sustainability dashboard for educational campuses. It combines real-time weather and air quality data with machine learning models to provide actionable energy optimization recommendations.

### Key Features

- **📊 Dashboard** — Summary cards, energy trends, building comparisons, waste composition charts
- **⚡ Energy Analytics** — Hourly consumption, heatmaps, peak predictions, anomaly detection
- **♻️ Waste Management** — Collection tracking, diversion rates, building-wise breakdowns
- **🔮 Predictions** — 7-day energy forecasts with confidence bands, what-if simulator
- **💡 Recommendations** — Prioritized optimization suggestions with savings estimates (₹, kWh, CO₂)
- **🗺️ Campus Map** — 3D satellite view with building energy overlays (Mapbox GL)
- **📄 Reports** — Exportable PDF/CSV reports with date range and building filters

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Charts** | Recharts |
| **Maps** | Mapbox GL JS |
| **Backend** | FastAPI, Python 3.10+ |
| **ML Models** | Prophet (energy forecasting), scikit-learn (anomaly detection) |
| **Database** | Supabase (PostgreSQL) |
| **External APIs** | Open-Meteo (weather/solar), CPCB (air quality) |

---

## Project Structure

```
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/               # Pages & API routes
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── energy/        # Energy analytics
│   │   │   ├── waste/         # Waste management
│   │   │   ├── predictions/   # ML predictions
│   │   │   ├── recommendations/
│   │   │   ├── reports/
│   │   │   ├── campus/        # 3D map view
│   │   │   └── api/           # Next.js API routes (proxy)
│   │   ├── components/        # Reusable UI components
│   │   └── lib/               # Utilities & Supabase client
│   └── .env.example           # Required env vars
│
├── backend/                   # FastAPI + ML pipeline
│   ├── app/
│   │   ├── main.py            # FastAPI server (12 endpoints)
│   │   ├── models/            # ML models (Prophet, Isolation Forest)
│   │   ├── services/          # Data & real-data services
│   │   ├── routers/           # API route handlers
│   │   └── schemas/           # Pydantic schemas
│   ├── data/                  # Seed scripts & training data
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Required env vars
│
└── .planning/
    └── REQUIREMENTS.md        # Feature requirements & roadmap
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **Supabase** account (free tier works)
- **Mapbox** token (free tier, for campus map)

### 1. Clone the Repository

```bash
git clone https://github.com/x70D/SmartCampusOptimizationDashboard.git
cd SmartCampusOptimizationDashboard
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials
```

**Seed the database** (first time only):

```bash
python -m data.seed_database
```

**Train ML models:**

```bash
python -m data.train_model
```

**Start the API server:**

```bash
python -m app.main
# Server runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase and Mapbox credentials

# Start development server
npm run dev
# App runs at http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `MODEL_PATH` | Path to trained models directory |
| `DATA_GOV_IN_KEY` | data.gov.in API key (for AQI data) |
| `CAMPUS_LAT` | Campus latitude coordinate |
| `CAMPUS_LON` | Campus longitude coordinate |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `NEXT_PUBLIC_PYTHON_API_URL` | Backend API URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL access token |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side only) |

> ⚠️ **Never commit `.env` or `.env.local` files.** Use the `.env.example` files as templates.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/model/status` | GET | Loaded model counts |
| `/train/all` | POST | Train models for all buildings |
| `/train/{building_id}` | POST | Train model for specific building |
| `/predict/energy` | POST | 7-day energy forecast |
| `/predict/peak` | POST | Peak demand detection |
| `/detect/anomalies` | POST | Run anomaly detection |
| `/recommend` | POST | Generate optimization recommendations |
| `/simulate` | POST | What-if scenario simulation |
| `/carbon/equivalences/{co2}` | GET | Carbon equivalence calculator |
| `/sustainability/score/{id}` | GET | Building sustainability rating |

---

## Database Schema

The application uses **7 Supabase tables**:

| Table | Description |
|-------|-------------|
| `buildings` | Campus buildings with metadata and coordinates |
| `energy_readings` | Hourly energy consumption records |
| `waste_records` | Daily waste collection by type |
| `anomalies` | Detected anomaly events |
| `recommendations` | Optimization suggestions with savings data |
| `carbon_footprint` | Daily CO₂ emission records |
| `predictions` | ML model forecast outputs |

---

## Screenshots

*Coming soon — run the app locally to explore the dashboard.*

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is developed for academic/educational purposes.

---

<div align="center">

**Built for smarter, greener campuses 🌱**

</div>
# EcoCampusAI
