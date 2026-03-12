# Phase 1: Setup & Foundation - Context

**Gathered:** 2025-03-12 via PRD and instructions
**Status:** Ready for planning
**Source:** PRD.md and free_model_instructions.md

## Phase Boundary

Build the foundational project structure, design system, and core infrastructure required before feature development. This includes:
- Next.js 14 project initialization with TypeScript, Tailwind, App Router
- Tailwind configuration with EcoCampus design tokens
- Global styles (Inter font, dark theme, glass-card utility)
- Supabase client setup
- Utility helper library
- Layout components: Sidebar (collapsible, 256px width, navigation links), TopBar (title, building selector, date, notifications, theme toggle), Root layout

All work is frontend-only; backend (FastAPI) already exists.

## Implementation Decisions

### Technology Stack
- **Framework**: Next.js 14 (App Router) — locked
- **Styling**: Tailwind CSS v3 — locked
- **Charts**: Recharts — locked
- **Icons**: Lucide React — locked
- **Date utilities**: date-fns — locked
- **Class merging**: clsx — locked
- **Database client**: @supabase/supabase-js — locked

### Design System
- **Primary color**: Emerald green (#10B981)
- **Accent color**: Blue (#3B82F6)
- **Background**: Dark slate (#0F172A)
- **Card style**: Glassmorphism (rgba(30,41,59,0.8), blur 12px, subtle border)
- **Typography**: Inter (weights 400,500,600,700)
- **Border radius**: 12px for cards, 8px for buttons
- **Mode**: Dark primary with light mode toggle

### Environment Configuration
- Frontend environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_PYTHON_API_URL
- Backend API URL: http://localhost:8000 (for later integration)

### Project Structure
- `frontend/` as Next.js app
- Components in `src/components/` with subfolders: layout/, dashboard/, energy/, waste/, predictions/, ui/
- Utilities in `src/lib/` (supabase.js, api.js, utils.js)
- Global styles in `src/styles/globals.css`

All implementation must follow Day 1 tasks from free_model_instructions.md exactly.

## Claude's Discretion

- Exact timing of animations (fade-in duration, count-up speed) — implement with reasonable defaults (300ms fade, 1s count-up)
- Skeleton loader design — use simple shimmer effect
- Empty state illustrations — use minimal text/icons (no custom images)
- Error message wording — keep friendly and concise

## Specific Ideas

- Sidebar: fixed left, width 256px, collapsible to 72px (icon-only)
- Sidebar logo: "🌱 EcoCampus AI"
- Navigation links: Dashboard (LayoutDashboard), Energy (Zap), Waste (Trash2), Predictions (Brain), Recommendations (Lightbulb), Reports (FileText)
- Active nav state: green left border + green tinted background
- Collapse toggle button at bottom of sidebar
- TopBar: page title (prop), building selector, date display, notification bell with badge, dark/light mode toggle
- Use `next/navigation` `usePathname()` for active link detection
- Glass-card utility class in CSS

## Deferred Ideas

- Authentication (Supabase Auth — deferred to v2)
- Real-time updates (WebSocket — deferred to v2)
- Email notifications — out of scope

---

*Phase: 01-setup*
*Context gathered: 2025-03-12 via PRD Express Path*
