# EcoCampus AI 🌍⚡

*Smart insights for a sustainable campus.*

EcoCampus AI is a full-stack dashboard designed to monitor real-time electricity consumption and waste generation, predict peak energy usage, detect anomalies, and suggest actionable optimization strategies.

## Architecture
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Recharts
- **Backend:** Python FastAPI for ML Models (Prophet, Isolation Forest)
- **Database:** Supabase (PostgreSQL)

## Getting Started

### 1. Start the Backend API
Navigate to the `backend` directory, activate the environment, and run the FastAPI server:
```bash
cd backend
.\venv\Scripts\activate
python -m app.main
```
Server runs at `http://localhost:8000`

### 2. Start the Frontend
Navigate to the `frontend` directory, install dependencies, and start the dev server:
```bash
cd frontend
npm install
npm run dev
```
Dashboard runs at `http://localhost:3000`

## Features Completed (v1)
- Responsive layout with Sidebar and TopBar navigation.
- Dashboard with high-level summaries and trend charts.
- Detailed Energy Analytics with heatmaps and anomaly tracking.
- Waste Management tracking and diversion goals.
- AI Predictions via simulated Python backend endpoints.
- AI Recommendations with carbon equivalences and PDF report generation.