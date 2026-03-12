# Requirements: EcoCampus AI

**Defined:** 2025-03-12
**Core Value:** Enable proactive sustainability through AI-driven insights that turn raw utility data into actionable savings opportunities

## v1 Requirements

### Dashboard

- [ ] **DASH-01**: Home page displays 5 summary cards: Total Energy Today, Today's Waste, Carbon Footprint, Monthly Savings, Sustainability Score
- [ ] **DASH-02**: 24-hour energy trend line chart shows actual consumption with predicted overlay
- [ ] **DASH-03**: Building-wise energy comparison bar chart displays all buildings
- [ ] **DASH-04**: Weekly energy trend area chart with forecast confidence band
- [ ] **DASH-05**: Waste composition donut chart (organic/recyclable/e-waste/general)
- [ ] **DASH-06**: Quick insights panel shows top 3 AI-generated insights with anomaly alerts and severity badges

### Energy

- [ ] **ENRG-01**: Energy analytics page with building selector dropdown and date range picker
- [ ] **ENRG-02**: Detailed hourly consumption line chart with peak markers
- [ ] **ENRG-03**: Day-of-week × hour-of-day heatmap (7×24 grid) with color intensity
- [ ] **ENRG-04**: Peak prediction card shows next predicted peak time, building, and expected kWh
- [ ] **ENRG-05**: Historical comparison overlay (this week vs last week)
- [ ] **ENRG-06**: Anomaly timeline displays detected events with timestamps, descriptions, severity badges

### Waste

- [ ] **WAST-01**: Daily waste collection stacked bar chart by type (organic, recyclable, e-waste, general)
- [ ] **WAST-02**: Building-wise waste table (sortable columns: building, each type, total)
- [ ] **WAST-03**: Waste diversion rate gauge chart showing % diverted from landfill (color-coded)
- [ ] **WAST-04**: Monthly waste trend chart with target line overlay
- [ ] **WAST-05**: Waste composition pie chart with interactive legend

### Predictions

- [ ] **PRED-01**: 7-day energy forecast chart with actual area, predicted dashed line, and confidence band
- [ ] **PRED-02**: Peak alert cards grid showing predicted peaks (date, time, building, kWh, severity)
- [ ] **PRED-03**: Model accuracy panel displays MAPE and R² scores with last trained date
- [ ] **PRED-04**: What-if simulator UI with sliders (AC shutdown time, lighting reduction %) and simulation button
- [ ] **PRED-05**: Explanation panel showing plain-English reasoning for AI predictions

### Recommendations

- [ ] **REC-01**: Recommendations page shows active suggestions as cards in grid layout
- [ ] **REC-02**: Each recommendation card includes: title, description, priority badge, category icon, estimated savings (₹/month and kWh), CO2 reduction, status dropdown (Pending/Implemented/Dismissed)
- [ ] **REC-03**: Status change triggers PATCH API call to update recommendation
- [ ] **REC-04**: Savings summary displays cumulative savings from implemented recommendations
- [ ] **REC-05**: Carbon impact equivalence shows tree count and car trips equivalent

### Reports

- [ ] **RPRT-01**: Reports page with date range selector (from/to) and building filter (multi-select or All)
- [ ] **RPRT-02**: Report preview section shows summary metrics, key charts, top anomalies, active recommendations
- [ ] **RPRT-03**: PDF export functionality (download PDF)
- [ ] **RPRT-04**: CSV export functionality (download CSV)

### UI/UX

- [x] **UI-01**: Sidebar navigation (collapsible, fixed left) with 6 nav links and active state highlighting
- [x] **UI-02**: Top bar with page title, building selector, date display, notification bell, dark/light mode toggle
- [ ] **UI-03**: Responsive layout: sidebar hidden on mobile, hamburger menu, stacked cards
- [x] **UI-04**: Dark mode primary theme with colors: primary (#10B981), accent (#3B82F6), dark background (#0F172A), glass-morphism cards
- [ ] **UI-05**: Inter font family throughout, border radius 12px for cards, 8px for buttons
- [ ] **UI-06**: Fade-in animations on page load, number count-up on summary cards, smooth chart transitions
- [ ] **UI-07**: Loading skeletons, error states with retry, empty states
- [ ] **UI-08**: Accessibility: proper aria-labels, keyboard navigation, focus states

### Integration

- [ ] **INT-01**: Next.js API routes proxy to Supabase (all endpoints: /api/dashboard/summary, /api/energy, /api/energy/buildings, /api/waste, /api/waste/summary, /api/anomalies, /api/recommendations, /api/carbon, /api/reports/generate)
- [ ] **INT-02**: Next.js API route for predictions (/api/predictions) calls FastAPI backend at http://localhost:8000
- [ ] **INT-03**: Next.js API route for simulation (/api/simulate) calls FastAPI backend
- [x] **INT-04**: Supabase client configured with provided URL and anon key
- [x] **INT-05**: All frontend components use API helper library (src/lib/api.js) for data fetching

## v2 Requirements

### Real-time Features

- **RT-01**: WebSocket connections for live energy consumption updates
- **RT-02**: Real-time anomaly push notifications

### Analytics

- **ANL-01**: Semester-over-semester comparative analysis
- **ANL-02**: Multi-building correlation analysis
- **ANL-03**: Custom report builder with drag-and-drop widgets

### Authentication & Multi-tenancy

- **AUTH-01**: Email/password authentication via Supabase Auth
- **AUTH-02**: Role-based access control (Admin, Department Head, Sustainability Officer)
- **AUTH-03**: Department-specific data filtering

### Notifications

- **NTFY-01**: Email alerts for critical anomalies
- **NTFY-02**: Scheduled weekly report emails
- **NTFY-03**: Threshold-based alert rules

### Mobile

- **MOB-01**: Progressive Web App (PWA) with offline capability
- **MOB-02**: Native mobile app (React Native) for field staff

### IoT Integration

- **IOT-01**: Live IoT device data ingestion (MQTT/WebSocket)
- **IOT-02**: Real-time device status monitoring dashboard

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time websocket updates | Deferred to v2 — core dashboard more important |
| Email alerts | Deferred to v2 — requires SMTP setup and scheduling |
| Semester comparative analysis | Deferred to v2 — additional analytics layer |
| IoT device mockup integration | Not needed for demo — synthetic data sufficient |
| Multi-campus support | Single campus scope for v1 |
| Mobile PWA | Responsive web covers mobile needs for v1 |
| User authentication | Public demo simplifies access; auth adds complexity |
| Advanced ML model training | Backend uses pre-trained models; training is out of scope |
| Custom report builder | Fixed report template for v1 |
| Multi-language support | English only for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DASH-01 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 1 | Pending |
| DASH-04 | Phase 1 | Pending |
| DASH-05 | Phase 1 | Pending |
| DASH-06 | Phase 1 | Pending |
| ENRG-01 | Phase 2 | Pending |
| ENRG-02 | Phase 2 | Pending |
| ENRG-03 | Phase 2 | Pending |
| ENRG-04 | Phase 2 | Pending |
| ENRG-05 | Phase 2 | Pending |
| ENRG-06 | Phase 2 | Pending |
| WAST-01 | Phase 3 | Pending |
| WAST-02 | Phase 3 | Pending |
| WAST-03 | Phase 3 | Pending |
| WAST-04 | Phase 3 | Pending |
| WAST-05 | Phase 3 | Pending |
| PRED-01 | Phase 4 | Pending |
| PRED-02 | Phase 4 | Pending |
| PRED-03 | Phase 4 | Pending |
| PRED-04 | Phase 4 | Pending |
| PRED-05 | Phase 4 | Pending |
| REC-01 | Phase 5 | Pending |
| REC-02 | Phase 5 | Pending |
| REC-03 | Phase 5 | Pending |
| REC-04 | Phase 5 | Pending |
| REC-05 | Phase 5 | Pending |
| RPRT-01 | Phase 6 | Pending |
| RPRT-02 | Phase 6 | Pending |
| RPRT-03 | Phase 6 | Pending |
| RPRT-04 | Phase 6 | Pending |
| UI-01 | Phase 7 | Complete |
| UI-02 | Phase 7 | Complete |
| UI-03 | Phase 7 | Pending |
| UI-04 | Phase 7 | Complete |
| UI-05 | Phase 7 | Pending |
| UI-06 | Phase 7 | Pending |
| UI-07 | Phase 7 | Pending |
| UI-08 | Phase 7 | Pending |
| INT-01 | Phase 7 | Pending |
| INT-02 | Phase 7 | Pending |
| INT-03 | Phase 7 | Pending |
| INT-04 | Phase 7 | Complete |
| INT-05 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0 ✓

---

*Requirements defined: 2025-03-12*
*Last updated: 2025-03-12 after initial definition*
