# 📋 PRD: AI-Based Campus Sustainability & Energy Optimization Dashboard

## 1. Project Overview

**Product Name:** EcoCampus AI  
**Tagline:** *Smart insights for a sustainable campus*  
**Duration:** 1 week  
**Team:** Solo developer (with AI-assisted development)

### 1.1 Problem Statement
University campuses consume massive amounts of electricity and generate significant waste, yet lack centralized, intelligent systems to monitor, predict, and optimize these patterns. Most sustainability efforts are reactive rather than proactive.

### 1.2 Solution
An AI-powered analytics dashboard that:
- **Monitors** real-time electricity consumption and waste generation across campus buildings
- **Predicts** peak energy usage using time-series forecasting (Prophet)
- **Detects** anomalies in consumption patterns
- **Suggests** actionable optimization strategies with estimated cost savings
- **Tracks** carbon footprint and sustainability goals

### 1.3 Key Differentiators
- AI-driven predictions with explainability (not just charts)
- Actionable recommendations with ₹ savings estimates
- Carbon equivalence visualization (trees saved, CO2 reduced)
- Real-time anomaly alerts

---

## 2. User Personas

| Persona | Role | Needs |
|---------|------|-------|
| **Campus Admin** | Facility manager | Overview of all buildings, cost insights, reports |
| **Department Head** | Building-level user | Their department's consumption, comparisons |
| **Sustainability Officer** | Strategy role | Carbon footprint, waste diversion, goal tracking |

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR, routing, UI |
| **Styling** | Tailwind CSS v3 | Rapid, consistent UI |
| **Charts** | Recharts | Interactive data visualization |
| **Backend API** | Next.js API Routes | CRUD, data serving |
| **AI/ML API** | Python FastAPI | Predictions, anomaly detection |
| **ML Libraries** | Prophet, scikit-learn, pandas | Forecasting, anomaly detection |
| **Database** | Supabase (PostgreSQL) | Data storage, real-time |
| **Auth** | Supabase Auth (optional) | Login for admin |

---

## 4. Feature Specification

### 4.1 Dashboard Home (`/`)

**Summary Cards Row:**
| Card | Data | Icon |
|------|------|------|
| Total Energy Today | Sum kWh across all buildings | ⚡ |
| Today's Waste | Total kg waste collected | 🗑️ |
| Carbon Footprint | CO2 equivalent (kg) | 🌍 |
| Monthly Savings | ₹ saved from optimizations | 💰 |
| Sustainability Score | 0-100 composite score | 🌱 |

**Charts Section:**
- **Line Chart:** 24-hour energy consumption trend (with predicted overlay)
- **Bar Chart:** Building-wise energy comparison
- **Area Chart:** Weekly energy trend with forecast band
- **Donut Chart:** Waste composition breakdown (organic/recyclable/e-waste/general)

**Quick Insights Panel:**
- Top 3 AI-generated insights (e.g., "Library AC ran 3 hours past closing yesterday")
- Anomaly alerts with severity badges

---

### 4.2 Energy Analytics (`/energy`)

- **Building Selector** — dropdown to filter by building
- **Date Range Picker** — custom range analysis
- **Detailed Line Chart** — hourly consumption with peak markers
- **Heatmap** — day-of-week × hour-of-day usage intensity
- **Peak Prediction Card** — "Next predicted peak: Tomorrow 2:00 PM, ~450 kWh"
- **Historical Comparison** — this week vs last week overlay
- **Anomaly Timeline** — flagged events with explanations

---

### 4.3 Waste Management (`/waste`)

- **Daily Collection Tracker** — stacked bar chart by waste type
- **Building-wise Waste Table** — sortable, with totals
- **Waste Diversion Rate** — % recyclable vs landfill (gauge chart)
- **Trend Analysis** — monthly waste trend with targets
- **Waste Composition Pie Chart** — breakdown with legends

---

### 4.4 AI Predictions (`/predictions`)

- **Forecast Chart** — next 7-day energy prediction with confidence bands
- **Peak Alert Cards** — upcoming predicted peaks with time, building, severity
- **Model Accuracy Panel** — MAPE, R² scores displayed
- **What-If Simulator** — adjust parameters (e.g., "if we shut AC at 6pm") and see impact
- **Explanation Panel** — plain-English explanation of why the AI predicts a spike

---

### 4.5 Recommendations (`/recommendations`)

- **Active Recommendations List** — AI-generated suggestions
  Each card shows:
  - Title (e.g., "Schedule HVAC shutdown at 6 PM in Science Block")
  - Estimated savings (₹/month and kWh)
  - Priority badge (High/Medium/Low)
  - Impact category (Energy/Waste/Carbon)
  - Status toggle (Implemented / Pending / Dismissed)
- **Savings Tracker** — cumulative savings from implemented recommendations
- **Carbon Impact** — CO2 reduction equivalence (trees, car trips)

---

### 4.6 Reports (`/reports`)

- **Date range selector**
- **Auto-generated summary** with key metrics
- **Export options**: PDF download, CSV data export
- **Email scheduling** (stretch goal)

---

## 5. Database Schema (Supabase/PostgreSQL)

```sql
-- Buildings on campus
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  type VARCHAR(50), -- academic, hostel, admin, library, lab
  area_sqft INTEGER,
  floors INTEGER,
  has_ac BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hourly electricity readings
CREATE TABLE energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  timestamp TIMESTAMPTZ NOT NULL,
  consumption_kwh DECIMAL(10,2) NOT NULL,
  voltage DECIMAL(6,2),
  current_amp DECIMAL(6,2),
  power_factor DECIMAL(4,2),
  is_peak_hour BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily waste collection
CREATE TABLE waste_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  date DATE NOT NULL,
  organic_kg DECIMAL(8,2) DEFAULT 0,
  recyclable_kg DECIMAL(8,2) DEFAULT 0,
  ewaste_kg DECIMAL(8,2) DEFAULT 0,
  general_kg DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  prediction_date DATE NOT NULL,
  predicted_kwh DECIMAL(10,2),
  confidence_lower DECIMAL(10,2),
  confidence_upper DECIMAL(10,2),
  is_peak_predicted BOOLEAN DEFAULT false,
  model_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anomaly events
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  detected_at TIMESTAMPTZ NOT NULL,
  anomaly_type VARCHAR(50), -- overconsumption, unusual_pattern, equipment_fault
  severity VARCHAR(10), -- low, medium, high, critical
  description TEXT,
  actual_kwh DECIMAL(10,2),
  expected_kwh DECIMAL(10,2),
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- energy, waste, carbon
  priority VARCHAR(10), -- high, medium, low
  estimated_savings_monthly DECIMAL(10,2),
  estimated_kwh_saved DECIMAL(10,2),
  co2_reduction_kg DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending', -- pending, implemented, dismissed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon footprint tracking
CREATE TABLE carbon_footprint (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_energy_kwh DECIMAL(12,2),
  co2_kg DECIMAL(10,2), -- 0.82 kg CO2 per kWh (India grid avg)
  trees_equivalent DECIMAL(8,2), -- 1 tree absorbs ~22 kg CO2/year
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_energy_building_time ON energy_readings(building_id, timestamp);
CREATE INDEX idx_waste_building_date ON waste_records(building_id, date);
CREATE INDEX idx_predictions_building_date ON predictions(building_id, prediction_date);
CREATE INDEX idx_anomalies_building ON anomalies(building_id, detected_at);
```

---

## 6. API Design

### 6.1 Next.js API Routes (Frontend Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Summary cards data |
| GET | `/api/energy?building=X&range=7d` | Energy readings with filters |
| GET | `/api/energy/buildings` | All buildings list |
| GET | `/api/waste?building=X&range=30d` | Waste records with filters |
| GET | `/api/waste/summary` | Waste composition totals |
| GET | `/api/anomalies?status=unresolved` | Active anomalies |
| GET | `/api/recommendations` | All recommendations |
| PATCH | `/api/recommendations/:id` | Update recommendation status |
| GET | `/api/carbon?range=30d` | Carbon footprint data |
| GET | `/api/reports/generate?format=pdf` | Generate PDF report |

### 6.2 Python FastAPI (AI/ML Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict/energy` | 7-day energy forecast for a building |
| POST | `/predict/peak` | Predict next peak usage time |
| POST | `/detect/anomalies` | Run anomaly detection on recent data |
| POST | `/recommend` | Generate optimization recommendations |
| GET | `/model/status` | Model health and accuracy metrics |
| POST | `/simulate` | What-if scenario simulation |

---

## 7. AI/ML Pipeline Specification

### 7.1 Energy Forecasting (Prophet)

```
Input:  Historical hourly energy data (min 3 months simulated)
Model:  Facebook Prophet with:
        - Daily seasonality (peak hours: 10AM-4PM)
        - Weekly seasonality (weekday vs weekend)
        - Holiday effects (exam weeks, semester breaks)
        - Custom regressors: temperature, occupancy
Output: Next 7 days hourly prediction + confidence intervals
Metric: MAPE < 10%, R² > 0.85
```

### 7.2 Anomaly Detection (Isolation Forest)

```
Input:   Recent 24h consumption vs historical baseline
Model:   Isolation Forest (scikit-learn)
Features: hour_of_day, day_of_week, consumption_kwh, 
          rolling_mean_24h, deviation_from_mean
Output:  Anomaly flag + severity + explanation
Threshold: Contamination = 0.05 (5% anomaly rate)
```

### 7.3 Recommendation Engine (Rule-based + ML)

```
Rules:
  - If after-hours consumption > 30% of peak → "Schedule equipment shutdown"
  - If weekend consumption > 60% of weekday → "Review weekend operations"  
  - If waste diversion < 40% → "Implement waste segregation drive"
  - If building consumption/sqft > campus avg × 1.5 → "Energy audit needed"

ML Enhancement:
  - Cluster similar buildings, identify outliers
  - Estimate savings based on historical correction data
```

---

## 8. Synthetic Data Specification

### Campus: "GreenTech University"

**Buildings (10 total):**

| Code | Name | Type | Area (sqft) | AC | Typical kWh/day |
|------|------|------|-------------|-----|-----------------|
| CSE | Computer Science Block | Academic | 15000 | Yes | 280-350 |
| ECE | Electronics Block | Academic | 12000 | Yes | 250-310 |
| LIB | Central Library | Library | 20000 | Yes | 320-400 |
| ADM | Admin Building | Admin | 8000 | Yes | 150-200 |
| MEC | Mechanical Workshop | Lab | 18000 | Partial | 400-500 |
| HOS1 | Boys Hostel A | Hostel | 25000 | Partial | 200-280 |
| HOS2 | Girls Hostel B | Hostel | 22000 | Partial | 180-260 |
| CAF | Cafeteria Complex | Amenity | 5000 | Yes | 180-250 |
| SPT | Sports Complex | Amenity | 30000 | No | 80-120 |
| SCI | Science Block | Academic | 14000 | Yes | 260-330 |

**Data Generation Rules:**
- 6 months of hourly energy data (Jan 2026 – June 2026)
- Weekday pattern: ramp 6AM→10AM, peak 10AM-4PM, decline 4PM→10PM, low overnight
- Weekend: 30-50% of weekday consumption
- Random anomalies injected (equipment faults, events)
- Exam weeks: +15% spike
- Summer months: +25% (AC load)
- Daily waste data with seasonal variation

---

## 9. UI/UX Guidelines

### Design Language
- **Theme:** Dark mode primary, light mode toggle
- **Colors:**
  - Primary: `#10B981` (emerald green — sustainability)
  - Accent: `#3B82F6` (blue — energy)
  - Warning: `#F59E0B` (amber)
  - Danger: `#EF4444` (red — anomalies)
  - Background: `#0F172A` (dark slate)
  - Cards: `#1E293B` with subtle border
- **Typography:** Inter font family
- **Border Radius:** 12px for cards, 8px for buttons
- **Animations:** Fade-in on page load, number count-up on cards, smooth chart transitions

### Layout
- **Sidebar navigation** (collapsible) — fixed left
- **Top bar** — page title, date range, building filter, notifications bell
- **Main content** — responsive grid (cards + charts)
- **Mobile:** Sidebar becomes bottom nav, stacked cards

---

## 10. Project Structure

```
e:\WorkSpace\Appathon\
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout with sidebar
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── energy/
│   │   │   │   └── page.tsx      # Energy analytics
│   │   │   ├── waste/
│   │   │   │   └── page.tsx      # Waste management
│   │   │   ├── predictions/
│   │   │   │   └── page.tsx      # AI predictions
│   │   │   ├── recommendations/
│   │   │   │   └── page.tsx      # Optimization suggestions
│   │   │   └── reports/
│   │   │       └── page.tsx      # Reports & export
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── PageWrapper.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCard.tsx
│   │   │   │   ├── EnergyLineChart.tsx
│   │   │   │   ├── BuildingBarChart.tsx
│   │   │   │   ├── WasteDonutChart.tsx
│   │   │   │   └── InsightsPanel.tsx
│   │   │   ├── energy/
│   │   │   │   ├── HeatmapChart.tsx
│   │   │   │   ├── PeakPredictionCard.tsx
│   │   │   │   └── AnomalyTimeline.tsx
│   │   │   ├── waste/
│   │   │   │   ├── WasteTracker.tsx
│   │   │   │   └── DiversionGauge.tsx
│   │   │   ├── predictions/
│   │   │   │   ├── ForecastChart.tsx
│   │   │   │   ├── WhatIfSimulator.tsx
│   │   │   │   └── ModelAccuracyCard.tsx
│   │   │   └── ui/
│   │   │       ├── Card.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Select.tsx
│   │   │       └── DatePicker.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   ├── api.ts           # API helper functions
│   │   │   └── utils.ts         # Formatting, calculations
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   │   └── icons/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
├── backend/                     # Python FastAPI (AI/ML)
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── routers/
│   │   │   ├── predictions.py   # Forecast endpoints
│   │   │   ├── anomalies.py     # Anomaly detection endpoints
│   │   │   ├── recommendations.py
│   │   │   └── simulation.py    # What-if scenarios
│   │   ├── models/
│   │   │   ├── prophet_model.py # Prophet forecasting logic
│   │   │   ├── anomaly_model.py # Isolation Forest logic
│   │   │   └── recommender.py   # Recommendation engine
│   │   ├── services/
│   │   │   ├── data_service.py  # Data fetching from Supabase
│   │   │   └── carbon_calc.py   # Carbon footprint calculations
│   │   ├── schemas/
│   │   │   ├── prediction.py    # Pydantic request/response models
│   │   │   └── anomaly.py
│   │   └── config.py            # Environment variables
│   ├── data/
│   │   ├── generate_synthetic.py   # Data generation script
│   │   └── seed_database.py        # Push data to Supabase
│   ├── notebooks/
│   │   └── exploration.ipynb       # EDA and model prototyping
│   ├── trained_models/             # Saved model artifacts
│   ├── requirements.txt
│   └── Dockerfile
│
├── .env.local                    # Supabase keys, API URLs
├── .gitignore
└── README.md
```

---

## 11. Implementation Timeline

### Day 1 (Setup + Data Foundation)
| Who | Task |
|-----|------|
| **Free Model** | Initialize Next.js project with Tailwind, set up project structure, configure Supabase |
| **Antigravity** | Build synthetic data generator, create database schema, seed Supabase |

### Day 2 (Dashboard Core)
| Who | Task |
|-----|------|
| **Free Model** | Build Sidebar, TopBar, layout components, Dashboard home page with summary cards |
| **Antigravity** | Set up FastAPI backend, build Prophet forecasting model, train on synthetic data |

### Day 3 (Energy + Charts)
| Who | Task |
|-----|------|
| **Free Model** | Energy analytics page with charts, building selector, date range picker |
| **Antigravity** | Anomaly detection engine, prediction API endpoints, connect to Supabase |

### Day 4 (Waste + Predictions)
| Who | Task |
|-----|------|
| **Free Model** | Waste management page, AI Predictions page UI |
| **Antigravity** | Recommendation engine, what-if simulator, carbon footprint calculator |

### Day 5 (Integration)
| Who | Task |
|-----|------|
| **Free Model** | Connect frontend to Next.js API routes, connect to Python API |
| **Antigravity** | API error handling, model optimization, edge case handling |

### Day 6 (Recommendations + Reports)
| Who | Task |
|-----|------|
| **Free Model** | Recommendations page, Reports page with PDF export |
| **Antigravity** | Final model tuning, performance testing, API load testing |

### Day 7 (Polish + Deploy)
| Who | Task |
|-----|------|
| **Free Model** | UI polish, animations, responsive design, dark/light toggle, README |
| **Antigravity** | End-to-end testing, bug fixes, deployment setup |

---

## 12. Environment Variables

```env
# .env.local (Frontend)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000

# .env (Backend)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
MODEL_PATH=./trained_models/
```

---

## 13. Success Metrics (for Judging)

| Metric | Target |
|--------|--------|
| Prediction Accuracy (MAPE) | < 10% |
| Dashboard Load Time | < 2s |
| Number of AI Insights | 5+ active at any time |
| Anomaly Detection Precision | > 80% |
| Code Quality | ESLint clean, typed APIs |
| UI/UX | Dark mode, responsive, animated |

---

## 14. Stretch Goals (if time permits)

- [ ] Real-time websocket updates for live consumption
- [ ] Email alerts for critical anomalies
- [ ] Comparative analysis between semesters
- [ ] IoT device mockup integration
- [ ] Multi-campus support
- [ ] Mobile PWA
