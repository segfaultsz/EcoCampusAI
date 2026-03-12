# EcoCampus AI

## What This Is

An AI-powered analytics dashboard that monitors electricity consumption and waste generation across a university campus, predicts peak energy usage, detects anomalies, and provides actionable optimization strategies with cost savings estimates. Built for campus facility managers, department heads, and sustainability officers to support green campus initiatives.

## Core Value

Enable proactive sustainability through AI-driven insights that turn raw utility data into actionable savings opportunities, reducing both environmental impact and operational costs.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Dashboard home page with real-time summary cards (energy, waste, carbon, savings, score)
- [ ] 24-hour energy trend chart with predicted overlay
- [ ] Building-wise energy comparison bar chart
- [ ] Weekly energy trend with forecast band
- [ ] Waste composition donut chart
- [ ] AI-generated quick insights panel with anomaly alerts
- [ ] Energy analytics page with building selector and date range picker
- [ ] Detailed hourly consumption chart with peak markers
- [ ] Day-of-week × hour-of-day heatmap
- [ ] Peak prediction card with countdown
- [ ] Historical comparison (this week vs last week)
- [ ] Anomaly timeline with severity badges
- [ ] Waste management page with daily collection tracker
- [ ] Building-wise waste table (sortable)
- [ ] Waste diversion gauge chart
- [ ] Monthly waste trend with targets
- [ ] AI predictions page with 7-day forecast chart and confidence bands
- [ ] Peak alert cards grid
- [ ] Model accuracy panel (MAPE, R²)
- [ ] What-if simulator UI for parameter adjustments
- [ ] AI explanation panel for predictions
- [ ] Recommendations page with suggestion cards
- [ ] Savings tracker and carbon impact equivalence display
- [ ] Reports page with date range selector, auto-generated summary, PDF/CSV export
- [ ] Responsive layout (sidebar navigation, top bar, mobile support)
- [ ] Dark/light mode toggle

### Out of Scope

- Real-time websocket updates — Defer to v2
- Email alerts for anomalies — Defer to v2
- Semester comparative analysis — Defer to v2
- IoT device mockup integration — Not needed for demo
- Multi-campus support — Single campus only for v1
- Mobile PWA — Responsive web suffices for v1
- User authentication — Public access only (Supabase Auth optional)

## Context

**Tech Stack (Pre-decided):**
- Frontend: Next.js 14 (App Router), Tailwind CSS, Recharts
- Backend: Python FastAPI (separate service, already built)
- Database: Supabase (PostgreSQL) with existing seeded data
- ML: Prophet (time-series forecasting), Isolation Forest (anomaly detection), rule-based recommender

**Backend Status:**
The Python FastAPI backend is complete with:
- 12 ML/AI endpoints (predictions, anomalies, recommendations, simulation)
- Trained models for all 10 campus buildings
- 43,440+ hourly energy records, waste data, carbon tracking
- Running at http://localhost:8000

**Data:**
Supabase database seeded with 6 months of synthetic data for 10 buildings (Jan-June 2026). Includes energy readings, waste records, anomalies, recommendations, predictions, and carbon footprint tracking.

**Integration Plan:**
Frontend will initially use mock data matching the PRD schema, then connect to Supabase via Next.js API routes (which proxy to FastAPI for ML endpoints). Python API URL: http://localhost:8000.

## Constraints

- **Timeline**: 1 week (solo developer with AI assistance)
- **Backend**: Must integrate with existing FastAPI service; cannot modify ML models
- **Data**: Must match Supabase schema from PRD; use mock data first, then real API
- **Design**: Follow PRD UI/UX guidelines (dark mode primary, emerald green accents, Inter font)
- **Deployment**: Local development focus; deployment optional stretch goal

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Modern SSR, excellent DX, API routes built-in | — Pending |
| Tailwind CSS v3 | Rapid UI development, matches design tokens | — Pending |
| Recharts for charts | React-native, flexible, good documentation | — Pending |
| Decoupled backend (FastAPI) | ML best in Python, separation of concerns | — Pending |
| Public access (no auth) | Simpler for demo, judging access | — Pending |
| Mock data first | Build UI without waiting for API | — Pending |
| Use Supabase anon key | RLS disabled, direct client access acceptable for demo | — Pending |

---

*Last updated: 2025-03-12 after initialization*
