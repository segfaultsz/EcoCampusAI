# 🤖 Free Model Instructions — EcoCampus AI Frontend & Infrastructure

> **Context:** You are building the frontend and standard backend for an AI-powered Campus Sustainability Dashboard called **EcoCampus AI**. Another AI agent (Antigravity) is handling the complex ML/AI backend. Follow these instructions sequentially.

---

## Day 1: Project Setup

### Task 1.1: Initialize Next.js Project

```bash
cd e:\WorkSpace\Appathon
npx -y create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd frontend
npm install recharts @supabase/supabase-js lucide-react date-fns clsx
```

### Task 1.2: Configure Tailwind Theme

Update `tailwind.config.ts` with EcoCampus design tokens:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B' },
        accent: { 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
        dark: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A', 950: '#020617' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '12px', '2xl': '16px' },
    },
  },
  plugins: [],
};
```

### Task 1.3: Set Up Global Styles

Update `src/styles/globals.css`:
- Import Google Font `Inter` (weights: 400, 500, 600, 700)
- Set body background to `#0F172A`, text to `#F1F5F9`
- Default dark mode styling
- Smooth scrolling, custom scrollbar styling
- Card glassmorphism utility class:
  ```css
  .glass-card {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
  }
  ```

### Task 1.4: Create Supabase Client

Create `src/lib/supabase.ts`:
```js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
```

Create `.env.local` with placeholder values (user will fill in Supabase creds later).

### Task 1.5: Create Utility Helpers

Create `src/lib/utils.ts` with:
- `formatNumber(num)` — adds commas, rounds to 1 decimal
- `formatKWh(kwh)` — e.g., "342.5 kWh"
- `formatCurrency(amount)` — e.g., "₹15,430"
- `formatCO2(kg)` — e.g., "12.5 kg CO₂"
- `getTimeAgo(date)` — relative time display
- `cn(...classes)` — className merge utility using `clsx`
- `getSeverityColor(severity)` — returns Tailwind color class for low/medium/high/critical

---

## Day 2: Layout & Dashboard Home

### Task 2.1: Build Sidebar Component

Create `src/components/layout/Sidebar.tsx`:
- Fixed left sidebar, width 256px, collapsible to 72px (icon-only)
- Dark background (`dark-900`), subtle left border
- Logo/app name at top: "🌱 EcoCampus AI"
- Navigation links using `lucide-react` icons:
  - Dashboard (`LayoutDashboard`)
  - Energy (`Zap`)
  - Waste (`Trash2`)
  - Predictions (`Brain`)
  - Recommendations (`Lightbulb`)
  - Reports (`FileText`)
- Active state: green left border + green tinted background
- Hover: subtle background shift
- Collapse toggle button at bottom
- Use `next/navigation` `usePathname()` for active state

### Task 2.2: Build TopBar Component

Create `src/components/layout/TopBar.tsx`:
- Page title (passed as prop)
- Right side: building selector dropdown, date display, notification bell icon with badge, dark/light mode toggle
- Sticky top, blur background

### Task 2.3: Build Root Layout

Update `src/app/layout.tsx`:
- Wrap with Sidebar + TopBar
- Main content area with proper padding
- Responsive: sidebar hidden on mobile, show hamburger menu

### Task 2.4: Build Summary Card Component

Create `src/components/dashboard/SummaryCard.tsx`:
- Props: `title`, `value`, `unit`, `icon`, `trend` (up/down %), `color`
- Glass card styling
- Large animated value (count-up animation on mount)
- Trend arrow with color (green up = good for savings, red up = bad for consumption)
- Subtle icon background

### Task 2.5: Build Dashboard Home Page

Update `src/app/page.tsx`:
- **Row 1:** 5 Summary cards in responsive grid
  - Total Energy Today: ⚡ 2,450 kWh
  - Today's Waste: 🗑️ 340 kg
  - Carbon Footprint: 🌍 2,009 kg CO₂
  - Monthly Savings: 💰 ₹24,500
  - Sustainability Score: 🌱 73/100
- **Row 2:** 2-column grid
  - Left: 24-hour energy trend line chart (Recharts `LineChart`)
  - Right: Building-wise bar chart (Recharts `BarChart`)
- **Row 3:** 2-column grid
  - Left: Weekly trend area chart with forecast overlay
  - Right: Waste donut chart (Recharts `PieChart`)
- **Row 4:** Quick Insights panel (3 AI insight cards)

> **Note:** Use hardcoded mock data initially. Antigravity will provide the API later. Structure data fetching so it's easy to swap mock data for real API calls.

---

## Day 3: Energy Analytics Page

### Task 3.1: Build Energy Analytics Page

Create `src/app/energy/page.tsx`:
- **Filters bar:** Building dropdown + date range picker
- **Main chart:** Detailed hourly consumption line chart with:
  - Actual consumption (solid line)
  - Predicted consumption (dashed line, different color)
  - Peak markers (red dots on peaks)
  - Tooltip with kwh value, time, building
- **Heatmap:** Day-of-week × Hour-of-day grid (use colored cells, 7×24 grid)
  - Color scale: green (low) → yellow (medium) → red (high)
- **Peak Prediction Card:** "Next predicted peak: Tomorrow 2:00 PM, ~450 kWh"
  - Countdown timer to next peak
  - Severity badge
- **Historical Comparison:** This week vs last week overlay chart
- **Anomaly Timeline:** Vertical timeline of detected anomalies
  - Each entry: timestamp, description, severity badge, building name

> Use mock data. Structure data as arrays that match the schema in the PRD.

---

## Day 4: Waste & Predictions Pages

### Task 4.1: Build Waste Management Page

Create `src/app/waste/page.tsx`:
- **Stacked Bar Chart:** Daily waste by type (organic, recyclable, e-waste, general)
- **Building Waste Table:** Sortable table with columns: Building, Organic, Recyclable, E-Waste, General, Total
- **Diversion Gauge:** Circular progress showing % waste diverted from landfill
  - Green if > 60%, yellow 40-60%, red < 40%
- **Trend Chart:** Monthly waste trend with target line overlay
- **Composition Pie Chart:** Waste breakdown with interactive legend

### Task 4.2: Build Predictions Page

Create `src/app/predictions/page.tsx`:
- **Forecast Chart:** Next 7-day energy prediction
  - Actual data: solid area
  - Prediction: dashed line with shaded confidence interval band
  - Use Recharts `Area` + `Line` combo
- **Peak Alert Cards:** Grid of upcoming predicted peak events
  - Each card: date, time, building, predicted kWh, severity badge
- **Model Accuracy Panel:** Card showing MAPE, R², last trained date
- **What-If Simulator:** (placeholder UI — Antigravity will connect the logic)
  - Slider: "If we shut AC at __ PM"
  - Slider: "If we reduce lighting by __%" 
  - Button: "Simulate"
  - Result area: estimated savings display
- **Explanation Panel:** Text area showing AI reasoning

> Use mock prediction data with confidence intervals. Antigravity will provide the real prediction API.

---

## Day 5: API Routes & Integration

### Task 5.1: Create Next.js API Routes

Create these API route files under `src/app/api/`:

**`/api/dashboard/summary/route.js`** — Returns summary metrics from Supabase  
**`/api/energy/route.js`** — Returns energy readings (accepts `building`, `range` query params)  
**`/api/energy/buildings/route.js`** — Returns all buildings  
**`/api/waste/route.js`** — Returns waste records (accepts `building`, `range` params)  
**`/api/waste/summary/route.js`** — Returns waste composition totals  
**`/api/anomalies/route.js`** — Returns anomalies (accepts `status` param)  
**`/api/recommendations/route.js`** — GET returns all, PATCH updates status  
**`/api/carbon/route.js`** — Returns carbon footprint data  

Each route should:
1. Parse query parameters
2. Query Supabase using the client
3. Return JSON with proper error handling
4. Include appropriate date filtering

### Task 5.2: Create API Helper Library

Create `src/lib/api.ts`:
- `fetchDashboardSummary()`
- `fetchEnergyData(buildingId, dateRange)`
- `fetchBuildings()`
- `fetchWasteData(buildingId, dateRange)`
- `fetchWasteSummary()`
- `fetchAnomalies(status)`
- `fetchRecommendations()`
- `updateRecommendation(id, status)`
- `fetchCarbonData(dateRange)`
- `fetchPredictions(buildingId)` — calls Python API via `NEXT_PUBLIC_PYTHON_API_URL`
- `runSimulation(params)` — calls Python API

### Task 5.3: Connect Frontend to APIs

Update all page components to:
1. Use `useEffect` + `useState` for data fetching (or SWR/React Query if preferred)
2. Add loading skeletons while data loads
3. Add error states with retry button
4. Replace all hardcoded mock data with API calls

---

## Day 6: Recommendations & Reports Pages

### Task 6.1: Build Recommendations Page

Create `src/app/recommendations/page.tsx`:
- **Recommendations List:** Cards in a grid layout
  Each card contains:
  - Title (bold)
  - Description (truncated, expandable)
  - Priority badge (High=red, Medium=amber, Low=green)
  - Category icon (Energy ⚡, Waste 🗑️, Carbon 🌍)
  - Estimated savings: "₹12,000/month | 150 kWh"
  - CO2 impact: "Reduces 123 kg CO₂"
  - Status dropdown: Pending → Implemented / Dismissed
  - Status change calls PATCH API
- **Savings Summary:** Total savings from implemented recommendations
- **Carbon Impact Equivalence:**
  - "Equivalent to planting X trees"
  - "Equivalent to taking X cars off the road for a month"

### Task 6.2: Build Reports Page

Create `src/app/reports/page.tsx`:
- Date range selector (from/to)
- Building filter (multi-select or "All")
- Report preview section showing:
  - Summary metrics for selected period
  - Key charts (energy trend, waste summary)
  - Top anomalies
  - Active recommendations
- **Export Buttons:**
  - "Download PDF" — use `window.print()` with print-friendly CSS or a library like `react-to-print`
  - "Download CSV" — generate CSV from data and trigger download

---

## Day 7: Polish & Finalize

### Task 7.1: UI Polish
- Add **fade-in animations** to all page content on mount (use CSS animations or Framer Motion)
- Add **number count-up animation** to summary cards
- Ensure **smooth chart transitions** when switching filters
- Add **hover effects** on all interactive elements
- Test **responsive design** at all breakpoints

### Task 7.2: Dark/Light Mode
- Implement theme toggle using `class` strategy
- Store preference in localStorage
- Apply appropriate colors for both themes

### Task 7.3: Loading & Error States
- Skeleton loaders for all data-dependent sections
- Empty states with illustrations
- Error boundaries with retry

### Task 7.4: README
Create a comprehensive `README.md` at project root with:
- Project description
- Screenshots (take them)
- Setup instructions
- Tech stack
- Architecture diagram (text-based or mermaid)
- Team credits

---

## ⚠️ Key Rules

1. **Always use mock data first** — Get the UI working with hardcoded data before connecting APIs
2. **Match the database schema** — Your mock data shape should exactly match the Supabase tables from the PRD
3. **Don't build the ML/AI parts** — Antigravity handles: data generation, Prophet model, anomaly detection, recommendations engine, Python FastAPI
4. **Component naming** — Use PascalCase for components, camelCase for utilities
5. **Keep components small** — Each file should be < 200 lines. Split large components
6. **Use the design tokens** — Always reference the Tailwind theme colors (primary-500, accent-500, dark-800, etc.), never hardcode hex values
7. **Accessibility** — Add proper `aria-labels`, keyboard navigation, focus states
