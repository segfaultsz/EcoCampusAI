# Phase 7: Polish & Integration - Context

## Objective
Finalize the EcoCampus AI dashboard by integrating real API connections from the Python FastAPI backend, perfecting the UI with animations and responsive design, adding loading/error states, and completing documentation.

## Requirements Addressed
- **UI-03**: Responsive layout: sidebar hidden on mobile, hamburger menu, stacked cards
- **UI-05**: Inter font family throughout, border radius 12px for cards, 8px for buttons (Review and verify)
- **UI-06**: Fade-in animations on page load, number count-up on summary cards, smooth chart transitions
- **UI-07**: Loading skeletons, error states with retry, empty states
- **UI-08**: Accessibility: proper aria-labels, keyboard navigation, focus states
- **INT-01**: Next.js API routes proxy to Supabase (all endpoints: /api/dashboard/summary, /api/energy, /api/energy/buildings, /api/waste, /api/waste/summary, /api/anomalies, /api/recommendations, /api/carbon, /api/reports/generate)
- **INT-02**: Next.js API route for predictions (/api/predictions) calls FastAPI backend using NEXT_PUBLIC_PYTHON_API_URL
- **INT-03**: Next.js API route for simulation (/api/simulate) calls FastAPI backend

## Success Criteria
1. Responsive design verified at all breakpoints (mobile bottom nav/hamburger, tablet, desktop).
2. UI animations implemented (fade-in, count-up).
3. API helper library `src/lib/api.js` implemented to proxy requests to Next.js API routes.
4. Next.js API routes created to fetch real data from Supabase and the local FastAPI backend.
5. All mock data in components replaced with API calls using React `useEffect` or SWR/React Query.
6. Loading skeleton components implemented for data-heavy sections.
7. README.md updated with setup instructions and project architecture.

## Technical Approach
- Ensure `NEXT_PUBLIC_PYTHON_API_URL` is used correctly in `src/lib/api.js`.
- Replace static mock data inside the components with dynamic state fetching.
- Add simple CSS animations for `fadeIn`.
- Update `Sidebar` to handle mobile responsiveness (hamburger menu).