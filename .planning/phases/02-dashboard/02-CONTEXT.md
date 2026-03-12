# Phase 2: Dashboard Home - Context

**Gathered:** 2025-03-12 via PRD and instructions
**Status:** Ready for planning
**Source:** PRD.md and free_model_instructions.md

## Phase Boundary

Build the main dashboard home page with all summary cards, charts, and insights panel using mock data. The dashboard is the landing page and provides at-a-glance visibility into campus sustainability metrics.

Components to build:
- Sidebar (collapsible navigation)
- TopBar (title, building selector, date, notifications, theme toggle)
- SummaryCard (reusable component with count-up animation)
- Energy line chart (24-hour trend with actual data)
- Building bar chart (energy comparison)
- Weekly area chart with forecast overlay
- Waste donut chart (composition)
- Quick Insights panel (AI-generated cards with anomaly badges)

All data initially mock, matching PRD schema. Layout should be responsive grid.

## Implementation Decisions

### Layout Structure
- **Dashboard Home (`/`)**: Root page
- **Grid system**: Tailwind grid with responsive columns
- **Rows**: Summary cards (1 row, 5 cards), Charts (2 rows with 2-column layout), Insights (full width)

### Components to Build (from free_model_instructions.md Day 2)
1. `Sidebar.jsx` — Fixed left, 256px, collapsible to 72px, logo + 6 nav links
2. `TopBar.jsx` — Sticky top, blur background, building selector, date, notifications bell, theme toggle
3. `SummaryCard.jsx` — Props: title, value, unit, icon, trend, color; includes count-up animation
4. `page.js` (home) — Composes all components, uses mock data

### Charts (using Recharts)
- `EnergyLineChart.jsx` — 24-hour line chart (x-axis: hours 0-23, y-axis: kWh)
- `BuildingBarChart.jsx` — Bar chart comparing 10 buildings
- `WeeklyTrendChart.jsx` — Area chart with forecast band overlay
- `WasteDonutChart.jsx` — Pie chart with 4 segments

### Mock Data
Create `src/lib/mockData.js` later in Phase 7? Actually for now hardcode in components or create a simple mock object. For Phase 2, we can use hardcoded arrays directly in page.js. Structure must match Supabase schema from PRD.

### Styling
- Use glass-card class for all cards
- Icons from lucide-react: ⚡ (Zap), 🗑️ (Trash2), 🌍 (Globe), 💰 (DollarSign), 🌱 (Leaf)
- Dark theme default
- Responsive: 1 column on mobile, 2 on tablet, 3-4 on desktop for cards; charts span full width or half

## Claude's Discretion

- Chart colors: Use primary-500 for energy, accent-500 for predictions/waste, gray for baseline
- Animation duration: 1s count-up, ease-out
- Mock data values: realistic numbers (e.g., energy: 200-500 kWh per building, waste: 200-400 kg total)
- Insights panel: 3 static cards initially (will be AI-generated later)

## Specific Ideas

- Sidebar nav links with lucide-react icons:
  - Dashboard: LayoutDashboard
  - Energy: Zap
  - Waste: Trash2
  - Predictions: Brain
  - Recommendations: Lightbulb
  - Reports: FileText
- Active state: `border-l-4 border-primary-500 bg-primary-900/30`
- TopBar building selector: Dropdown with building codes (CSE, ECE, LIB, ADM, MEC, HOS1, HOS2, CAF, SPT, SCI)
- Theme toggle: Sun/Moon icons, toggle class `dark` on html element
- Summary cards layout: sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4
- Chart containers: Wrap in glass-card with padding
- Fade-in page: Keyframe animation `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }` with `animation: fadeIn 0.5s ease-out;`

## Deferred Ideas

- API integration (Phase 7)
- Error handling/skeletons (Phase 7)
- Real-time updates (v2)

---

*Phase: 02-dashboard*
*Context gathered: 2025-03-12 via PRD Express Path*
