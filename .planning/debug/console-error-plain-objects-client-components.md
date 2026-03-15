---
status: resolved
trigger: "Investigate issue: console-error-plain-objects-client-components"
created: 2024-05-24T00:00:00Z
updated: 2024-05-24T00:00:00Z
---

## Current Focus
hypothesis: Passing a React component (Lucide icon) as a prop from Server Component to Client Component causes serialization error in Next.js App Router.
test: Check `src/app/page.tsx` and `src/components/dashboard/SummaryCard.jsx` to see how icons are passed and rendered.
expecting: `page.tsx` is importing icons and passing them as `icon={IconComponent}` to `SummaryCard`, which is a Client component.
next_action: Issue is resolved. Fix applied to `page.tsx` and `SummaryCard.jsx`.

## Symptoms
expected: The dashboard home page `/` should render without throwing serialization errors, displaying the SummaryCards properly.
actual: A React server component serialization error blocks rendering when passing the Lucide icon reference from the Server Component (`page.tsx`) to the Client Component (`SummaryCard`).
errors: Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported. <... title=... value={2450} unit="kWh" icon={{$$typeof: ..., render: ...}} trend=... trendUpIsGood=... color=...>
reproduction: Start the server via `npm run dev` and attempt to load the root `/` path.
started: Started appearing when running the local dev server after the Phase 7 integration changes.

## Eliminated

## Evidence
- timestamp: 2024-05-24T00:00:00Z
  checked: `src/app/page.tsx`
  found: The `SummaryCard` is mapped over `summaryCards` array where `icon: Zap` (the un-rendered React component) is passed as a prop.
  implication: This confirms the hypothesis. Server components cannot pass React component functions as props.
- timestamp: 2024-05-24T00:00:00Z
  checked: `src/components/dashboard/SummaryCard.jsx`
  found: It expects `icon: Icon` and renders `<Icon className="h-6 w-6" />`.
  implication: We can change the prop to be a fully rendered element on the server, which is allowed to be passed.

## Resolution
root_cause: React Server Components in Next.js cannot serialize and pass function components (like Lucide icons) directly as props to Client Components.
fix: Rendered the Lucide icons directly in the server component `page.tsx` (e.g. `<Zap className="h-6 w-6" />`) and passed them as a React node to `SummaryCard.jsx`, which now uses `{icon}` to display them.
verification: Verified that `npm run build` succeeds and Next.js can successfully prerender the page without the serialization error. (Also fixed a minor unrelated TypeScript error in `recommendations/page.tsx` that broke the build).
files_changed: 
  - `src/app/page.tsx`
  - `src/components/dashboard/SummaryCard.jsx`
  - `src/app/recommendations/page.tsx`