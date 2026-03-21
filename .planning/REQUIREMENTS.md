# Requirements: EcoCampus AI

**Smart Campus Sustainability Optimization Dashboard**

## Core Value

Enable proactive sustainability through data-driven insights that turn raw utility data into actionable savings opportunities for educational campuses.

---

## v1 Requirements

### Dashboard

| ID | Requirement | Status |
|----|------------|--------|
| DASH-01 | Home page displays 5 summary cards: Total Energy Today, Today's Waste, Carbon Footprint, Monthly Savings, Sustainability Score | ✅ |
| DASH-02 | 24-hour energy trend line chart with actual consumption and predicted overlay | ✅ |
| DASH-03 | Building-wise energy comparison bar chart for all buildings | ✅ |
| DASH-04 | Weekly energy trend area chart with forecast confidence band | ✅ |
| DASH-05 | Waste composition donut chart (organic/recyclable/e-waste/general) | ✅ |
| DASH-06 | Quick insights panel with top 3 insights, anomaly alerts, and severity badges | ✅ |

### Energy Analytics

| ID | Requirement | Status |
|----|------------|--------|
| ENRG-01 | Energy analytics page with building selector and date range picker | ✅ |
| ENRG-02 | Detailed hourly consumption line chart with peak markers | ✅ |
| ENRG-03 | Day-of-week × hour-of-day heatmap (7×24 grid) with color intensity | ✅ |
| ENRG-04 | Peak prediction card with next predicted peak time, building, and expected kWh | ✅ |
| ENRG-05 | Historical comparison overlay (this week vs last week) | ✅ |
| ENRG-06 | Anomaly timeline with timestamps, descriptions, and severity badges | ✅ |

### Waste Management

| ID | Requirement | Status |
|----|------------|--------|
| WAST-01 | Daily waste collection stacked bar chart by type | ✅ |
| WAST-02 | Building-wise waste table (sortable: building, each type, total) | ✅ |
| WAST-03 | Waste diversion rate gauge chart (% diverted from landfill) | ✅ |
| WAST-04 | Monthly waste trend chart with target line overlay | ✅ |
| WAST-05 | Waste composition pie chart with interactive legend | ✅ |

### Predictions

| ID | Requirement | Status |
|----|------------|--------|
| PRED-01 | 7-day energy forecast chart with actual area, predicted line, and confidence band | 🔲 |
| PRED-02 | Peak alert cards grid (date, time, building, kWh, severity) | 🔲 |
| PRED-03 | Model accuracy panel displaying MAPE and R² scores with last trained date | 🔲 |
| PRED-04 | What-if simulator with sliders (AC shutdown time, lighting reduction %) | 🔲 |
| PRED-05 | Explanation panel with plain-English reasoning for predictions | 🔲 |

### Recommendations

| ID | Requirement | Status |
|----|------------|--------|
| REC-01 | Recommendations page with cards in grid layout | 🔲 |
| REC-02 | Each card: title, priority badge, category icon, savings (₹/month, kWh), CO₂, status dropdown | 🔲 |
| REC-03 | Status change triggers API call to update recommendation | 🔲 |
| REC-04 | Savings summary for cumulative savings from implemented recommendations | 🔲 |
| REC-05 | Carbon impact equivalence (tree count, car trips equivalent) | 🔲 |

### Reports

| ID | Requirement | Status |
|----|------------|--------|
| RPRT-01 | Reports page with date range selector and building filter | 🔲 |
| RPRT-02 | Report preview: summary metrics, charts, top anomalies, recommendations | 🔲 |
| RPRT-03 | PDF export functionality | 🔲 |
| RPRT-04 | CSV export functionality | 🔲 |

### UI/UX

| ID | Requirement | Status |
|----|------------|--------|
| UI-01 | Collapsible sidebar navigation with 6 nav links and active state | ✅ |
| UI-02 | Top bar with page title, building selector, date display, notifications, theme toggle | ✅ |
| UI-03 | Responsive layout: sidebar hidden on mobile, hamburger menu, stacked cards | 🔲 |
| UI-04 | Dark mode theme with glassmorphism cards | ✅ |
| UI-05 | Consistent typography (Inter font) and border radius | 🔲 |
| UI-06 | Fade-in animations, count-up on summary cards, smooth chart transitions | 🔲 |
| UI-07 | Loading skeletons, error states with retry, empty states | 🔲 |
| UI-08 | Accessibility: aria-labels, keyboard navigation, focus states | 🔲 |

### Integration

| ID | Requirement | Status |
|----|------------|--------|
| INT-01 | Next.js API routes proxy to Supabase for all data endpoints | 🔲 |
| INT-02 | Next.js API route for predictions proxies to FastAPI backend | 🔲 |
| INT-03 | Next.js API route for simulation proxies to FastAPI backend | 🔲 |
| INT-04 | Supabase client configured with environment variables | ✅ |
| INT-05 | All frontend components use API helper library for data fetching | ✅ |

---

## v2 Roadmap

### Real-time Features
- WebSocket connections for live energy consumption updates
- Real-time anomaly push notifications

### Advanced Analytics
- Semester-over-semester comparative analysis
- Multi-building correlation analysis
- Custom report builder with drag-and-drop widgets

### Authentication & Multi-tenancy
- Email/password authentication via Supabase Auth
- Role-based access control (Admin, Department Head, Sustainability Officer)
- Department-specific data filtering

### Notifications
- Email alerts for critical anomalies
- Scheduled weekly report emails
- Threshold-based alert rules

### Mobile
- Progressive Web App (PWA) with offline capability
- Native mobile app for field staff

### IoT Integration
- Live IoT device data ingestion (MQTT/WebSocket)
- Real-time device status monitoring dashboard

---

## Out of Scope (v1)

| Feature | Reason |
|---------|--------|
| Real-time websocket updates | Deferred to v2 |
| Email alerts | Requires SMTP setup and scheduling |
| Semester comparative analysis | Additional analytics layer for v2 |
| IoT device integration | Synthetic data sufficient for v1 |
| Multi-campus support | Single campus scope for v1 |
| Mobile PWA | Responsive web covers mobile needs |
| User authentication | Public demo simplifies access |
| Custom report builder | Fixed report template for v1 |
| Multi-language support | English only for v1 |

---

## Coverage Summary

- **v1 requirements:** 42 total
- **Completed:** 21
- **Pending:** 21
