# Phase 3: Energy Analytics - Context

**Gathered:** 2025-03-12 via PRD and instructions
**Status:** Ready for planning
**Source:** PRD.md and free_model_instructions.md

## Phase Boundary

Build the Energy Analytics page (`/energy`) with detailed consumption analysis features. This page provides building-level and campus-wide energy insights with filtering, heatmaps, peak predictions, and anomaly detection.

Components to build:
- Building selector dropdown (already in TopBar, but need to use it)
- Date range picker (custom range)
- Detailed hourly consumption line chart (actual + predicted, peak markers)
- Heatmap (day-of-week × hour-of-day intensity grid)
- Peak prediction card (next peak time, building, kWh, countdown, severity)
- Historical comparison overlay (this week vs last week)
- Anomaly timeline (vertical list of anomalies with timestamps, descriptions, severity badges)

All using mock data, responsive layout.

## Implementation Decisions

### Page Structure
- Route: `/energy`
- Uses existing Sidebar, TopBar, layout
- Filters: Building selector (needs a single state strategy via Context in future, for now local state in page), date range picker (use `<input type="date">` or a simple library? Keep simple: two date inputs)
- Charts arranged in logical flow: main consumption chart first, then heatmap, then peak prediction + historical comparison side-by-side, then anomaly timeline

### Components to Create (in `src/components/energy/`)
1. `EnergyPage.jsx` — main page component
2. `EnergyLineChart.jsx` — already built? That was for dashboard 24h. Need new one with peak markers and this/compare overlay
3. `HeatmapChart.jsx` — 7×24 grid with color intensity
4. `PeakPredictionCard.jsx` — shows next predicted peak
5. `AnomalyTimeline.jsx` — vertical list of anomalies
6. Reuse `BuildingBarChart`? No, different

Actually from plan: We already created EnergyLineChart for dashboard. But that's 24h simple. Energy page needs more detailed with peak markers and historical overlay. We can create a new component or enhance. Simpler: create new `EnergyDetailChart.jsx`.

Better structure:
- `EnergyPage.jsx` — page container, state (building, date range)
- `EnergyDetailChart.jsx` — hourly consumption with predicted overlay, peak markers, tooltips
- `HeatmapChart.jsx`
- `PeakPredictionCard.jsx`
- `ComparisonChart.jsx` — this week vs last week overlay (can be part of EnergyDetailChart? Separate is clearer)
- `AnomalyTimeline.jsx`

Let's consolidate: fewer components is okay. We can create just 3-4 components.

Given time, I'll create:
- `EnergyPage.jsx` (main)
- `EnergyDetailChart.jsx` (hourly line with peaks)
- `HeatmapChart.jsx`
- `PeakPredictionCard.jsx`
- `AnomalyTimeline.jsx`

And maybe combine comparison into EnergyDetailChart as a toggle or separate panel.

Actually free_model_instructions.md says:
- Detailed Line Chart — hourly consumption with peak markers
- Heatmap
- Peak Prediction Card
- Historical Comparison — this week vs last week overlay
- Anomaly Timeline

So 5 sub-components + page.

Let's map:
- EnergyPage: assembles
- EnergyDetailChart.jsx: hourly consumption with peak markers (actual + predicted)
- HeatmapChart.jsx: 7x24 grid
- PeakPredictionCard.jsx: next peak info
- ComparisonChart.jsx: this week vs last week overlay (can be another EnergyDetailChart instance with different data? Or simpler: a line chart comparing two weeks)
- AnomalyTimeline.jsx

6 components total.

### Data & State
- Building selector: from TopBar? For now, local state in page (useState)
- Date range: startDate, endDate (default last 7 days)
- Mock data functions that generate data based on building and range

### Styling
- Glass cards for each section
- Grid layout: 2 columns for some components

## Claude's Discretion

- Heatmap colors: green (low), yellow (medium), red (high) — define thresholds: <50% of max = green, 50-80% = yellow, >80% = red
- Peak marker: red dot on the line chart at highest consumption hour
- Countdown timer: simple `setInterval` updating every second, display "Xh Ym" until next peak
- Historical comparison: two lines (solid = this week, dashed = last week) on same chart
- Anomaly timeline: vertical timeline with dots, each entry card with severity badge

## Specific Ideas

- Heatmap grid: 7 rows (Mon-Sun) × 24 columns (hours 0-23). Use CSS grid. Cell color based on normalized consumption (0-1 scale)
- PeakPredictionCard: "Next predicted peak: Tomorrow 2:00 PM, ~450 kWh" + severity "High" + countdown "3h 15m"
- AnomalyTimeline: list with left border line, dots on timeline, cards alternating or simple vertical stack
- Use Recharts for charts; Heatmap can be custom div grid (simpler)
- Date range picker: two `<input type="date">` elements, onChange update data

## Deferred Ideas

- Real API integration (Phase 7)
- Advanced filtering (building+date combined)
- Export functionality

---

*Phase: 03-energy*
*Context gathered: 2025-03-12 via PRD Express Path*
