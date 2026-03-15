# Roadmap: EcoCampus AI

**Phases:** 7 | **Requirements:** 42/42 mapped ✓ | All v1 requirements covered

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Setup & Foundation | Complete    | 2026-03-12 | 5 |
| 2 | Dashboard Home | Complete    | 2026-03-12 | 6 |
| 3 | Energy Analytics | Complete    | 2026-03-12 | 6 |
| 4 | Waste Management | Complete    | 2026-03-12 | 5 |
| 5 | Predictions | Complete | 2026-03-13 | 5 |
| 6 | Recommendations & Reports | Complete | 2026-03-13 | 9 |
| 7 | Polish & Integration | Complete | 2026-03-13 | 6 |
| 8 | Data Availability Fixes | Complete | 2026-03-15 | 2 |

**Total:** 8 phases | 44 requirements | 44 mapped (100%)

---

## Phase Details

... (rest of phases)

### Phase 8: Data Availability Fixes

**Goal:** Implement backend hourly energy stats and fix AQI data retrieval.

**Requirements:** DASH-01, DASH-03, ENRG-03, INT-02

**Success Criteria:**
1. Backend provides /api/real/energy/hourly endpoint with actual vs predicted data.
2. AQI service calculates robust AQI by aggregating all pollutant IDs from data.gov.in.
3. Next.js API proxy route created for energy hourly data.

**Day:** 8

**Key Deliverables:** Fully functional real-time energy charts and AQI card.


### Phase 1: Setup & Foundation

**Goal:** Establish project structure, design system, and core infrastructure

**Requirements:** UI-01, UI-02, UI-04, INT-04, INT-05

**Success Criteria:**
1. Next.js 14 project initialized with TypeScript and Tailwind
2. Tailwind config includes EcoCampus design tokens (primary green, accent blue, dark theme)
3. Global styles set up (Inter font, dark background, glass-card utility)
4. Supabase client created in src/lib/supabase.js with env variables
5. Utility helpers created (formatNumber, formatCurrency, formatCO2, getSeverityColor, cn)
6. Layout components built: Sidebar (collapsible, navigation links), TopBar (title, filters, theme toggle)
7. Root layout wraps app with Sidebar + TopBar + main content area
8. Design tokens verified via style guide test page

**Day:** 1 (from free_model_instructions.md)

**Key Deliverables:** Project scaffolding, design system, navigation layout

---

### Phase 2: Dashboard Home

**Goal:** Complete main dashboard with all summary cards and charts using mock data

**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06

**Success Criteria:**
1. SummaryCard component displays title, animated value, unit, icon, trend, color
2. Dashboard page shows 5 summary cards in responsive grid (Total Energy, Waste, Carbon, Savings, Score)
3. 24-hour energy trend line chart (Recharts LineChart) with tooltips
4. Building-wise bar chart (Recharts BarChart) showing kWh comparison
5. Weekly trend area chart with forecast overlay band
6. Waste donut chart (Recharts PieChart) with organic/recyclable/e-waste/general breakdown
7. Quick Insights panel shows at least 3 AI insight cards with anomaly badges
8. All components use mock data matching PRD schema
9. Data fetching structure ready for API swap (api.js functions exist but not yet connected)

**Day:** 2

**Key Deliverables:** Dashboard home fully functional with mock data

---

### Phase 3: Energy Analytics

**Goal:** Build energy page with detailed analysis features

**Requirements:** ENRG-01, ENRG-02, ENRG-03, ENRG-04, ENRG-05, ENRG-06

**Success Criteria:**
1. Building selector dropdown populated from mock buildings list
2. Date range picker allows custom range selection
3. Detailed hourly consumption line chart with actual (solid) and predicted (dashed) lines
4. Peak markers displayed as red dots on consumption peaks
5. Heatmap: 7×24 grid (days of week × hours) with green→yellow→red color scale
6. Peak prediction card shows "Next predicted peak: [time], ~[kWh]" with countdown timer and severity badge
7. Historical comparison overlay chart (this week vs last week)
8. Anomaly timeline: vertical list of flagged events with timestamp, description, severity badge, building name
9. All data sources use mock arrays matching PRD schema

**Day:** 3

**Key Deliverables:** Energy analytics page complete

---

### Phase 4: Waste Management

**Goal:** Complete waste tracking page with charts and data table

**Requirements:** WAST-01, WAST-02, WAST-03, WAST-04, WAST-05

**Success Criteria:**
1. Stacked bar chart shows daily waste by type (organic, recyclable, e-waste, general)
2. Building-wise waste table with sortable columns: Building, Organic, Recyclable, E-Waste, General, Total
3. Diversion gauge chart: circular progress showing % diverted from landfill (>60% green, 40-60% yellow, <40% red)
4. Monthly waste trend chart with target line overlay (dashed)
5. Waste composition pie chart with interactive legend (click to toggle)
6. All visualizations update when building filter changes
7. Mock data includes at least 10 buildings with realistic waste profiles

**Day:** 4

**Key Deliverables:** Waste management page complete

---

### Phase 5: Predictions

**Goal:** Build AI predictions page with forecast visualization and simulator

**Requirements:** PRED-01, PRED-02, PRED-03, PRED-04, PRED-05

**Success Criteria:**
1. 7-day energy forecast chart: actual data as area, predicted line (dashed), shaded confidence interval band
2. Peak alert cards grid: each card shows date, time, building, predicted kWh, severity badge
3. Model accuracy panel displays MAPE (<10% target), R² (>0.85 target), and last trained date
4. What-if simulator UI: two sliders (AC shutdown time, lighting reduction %), "Simulate" button, results area showing estimated savings
5. Explanation panel displays plain-English reasoning text (e.g., "Peak predicted due to exam week occupancy")
6. Simulator initially shows mock results (will connect to /api/simulate in Phase 7)

**Day:** 4 (continued)

**Key Deliverables:** Predictions page with interactive simulator

---

### Phase 6: Recommendations & Reports

**Goal:** Complete recommendations management and report export features

**Requirements:** REC-01, REC-02, REC-03, REC-04, REC-05, RPRT-01, RPRT-02, RPRT-03, RPRT-04

**Success Criteria:**
1. Recommendations page shows list of suggestion cards in responsive grid
2. Each recommendation card includes: title, description (expandable), priority badge (High red, Medium amber, Low green), category icon (Energy ⚡, Waste 🗑️, Carbon 🌍), estimated savings (₹/month and kWh), CO2 reduction, status dropdown (Pending/Implemented/Dismissed)
3. Status change triggers PATCH call to /api/recommendations/:id (mocked for now)
4. Savings summary displays total ₹ from implemented recommendations
5. Carbon equivalence shows "Equivalent to planting X trees" and "X cars off road for a month"
6. Reports page: date range pickers, building multi-select (or All), preview section with summary metrics, charts, anomalies, recommendations
7. PDF export uses window.print() with print-friendly CSS
8. CSV export generates and downloads CSV from mock data

**Day:** 6

**Key Deliverables:** Recommendations and Reports pages fully functional

---

### Phase 7: Polish & Integration

**Goal:** Final polish, API integration, responsive design, accessibility

**Requirements:** UI-03, UI-05, UI-06, UI-07, UI-08, INT-01, INT-02, INT-03

**Success Criteria:**
1. Responsive design verified at all breakpoints: mobile (sidebar → bottom nav, stacked cards), tablet, desktop
2. Dark/light mode toggle functional with localStorage persistence
3. Fade-in CSS animations on all page mounts (@keyframes fadeIn)
4. Number count-up animation on summary cards (use useEffect + requestAnimationFrame)
5. Smooth Recharts chart transitions when data updates
6. Hover effects on all interactive elements (buttons, cards, table rows)
7. Skeleton loaders implement for all data sections (loading state)
8. Error boundaries catch and display errors with retry buttons
9. All Next.js API routes created (12 endpoints as per PRD)
10. API helper library (src/lib/api.js) connects frontend to all endpoints
11. Predictions API routes call FastAPI at http://localhost:8000
12. Supabase client integrated — swap mock data for real queries
13. Accessibility: all interactive elements have aria-labels, keyboard navigation works, focus states visible
14. ESLint passes with zero warnings
15. README.md created with project description, screenshots, setup instructions, architecture diagram, team credits

**Day:** 7

**Key Deliverables:** Production-ready UI, fully connected to backend, deployable

---

## Traceability Cross-Reference

All 42 v1 requirements mapped above in Phase Details. Each requirement appears exactly once.

**Coverage Check:**
- Dashboard: 6/6 requirements ✓
- Energy: 6/6 ✓
- Waste: 5/5 ✓
- Predictions: 5/5 ✓
- Recommendations: 5/5 ✓
- Reports: 4/4 ✓
- UI/UX: 8/8 ✓
- Integration: 5/5 ✓

Total: 42/42 (100%)

---

## Dependencies

**Sequential flow:**
- Phase 1 must complete before any other phase (layout dependency)
- Phases 2-6 are feature-independent and could run in parallel (but follow day-by-day order for learning progression)
- Phase 7 depends on all previous phases being complete (integration)

**External dependencies:**
- FastAPI backend running at http://localhost:8000 (assumed available during Phase 7)
- Supabase project created and accessible (URL and key known)

---

## Notes

- Mock data shape must exactly match PRD database schema
- All components initially built with mock data, then swapped to real API in Phase 7
- Follow free_model_instructions.md for detailed implementation guidance per day
- Use design tokens from Tailwind config (primary-500, accent-500, dark-800, etc.) — never hardcode hex values
- Keep components < 200 lines; split when needed
