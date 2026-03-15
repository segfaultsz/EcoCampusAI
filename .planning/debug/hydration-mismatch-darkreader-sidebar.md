---
status: awaiting_human_verify
trigger: "Investigate issue: hydration-mismatch-darkreader-sidebar"
created: 2024-05-24T00:00:00Z
updated: 2024-05-24T00:00:00Z
---

## Current Focus
hypothesis: Dark Reader injects attributes into `<html>` and SVG elements, causing Next.js to throw a hydration mismatch error. Next.js provides `suppressHydrationWarning` to ignore these specific mismatches.
test: Added `suppressHydrationWarning` to the `<html>` tag in `src/app/layout.tsx`, to the SVGs in `src/components/layout/Sidebar.jsx`, and to the time/SVGs in `src/components/layout/TopBar.jsx`.
expecting: The hydration mismatch errors stop appearing when the page is loaded with Dark Reader enabled, and the date rendering works without mismatch.
next_action: Await human verification that the hydration error is gone when Dark Reader is enabled.

## Symptoms
expected: The layout and sidebar should render cleanly without throwing hydration mismatches between the SSR output and the client state.
actual: Next.js throws a hydration mismatch error. The React Dev Overlay diff shows attributes like `data-darkreader-mode` and `--darkreader-inline-stroke` being injected on the client side that weren't there during server-side rendering.
errors: "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up."
reproduction: Load the app with the Dark Reader browser extension enabled.
started: Discovered when trying to load the frontend after the Phase 7 integration.

## Eliminated

## Evidence
- 2024-05-24T00:00:00Z: Examined `src/app/layout.tsx` and observed `<html>` element does not have `suppressHydrationWarning`.
- 2024-05-24T00:00:00Z: Examined `src/components/layout/Sidebar.jsx` and found `lucide-react` icons (Menu, X, dynamic Icon) which receive styles injected by Dark Reader.
- 2024-05-24T00:00:00Z: Examined `src/components/layout/TopBar.jsx` and found the client-side/state approach (or explicit-locale/ISO approach) and more icons, which also cause mismatches.
- 2024-05-24T00:00:00Z: Added `suppressHydrationWarning` where appropriate.
- 2024-05-24T00:00:00Z: Ran `npm run build` locally to confirm the changes compile successfully without type or compilation errors.

## Resolution
root_cause: Browser extensions like Dark Reader inject attributes (e.g. `data-darkreader-mode`, `--darkreader-inline-stroke`) into `<html>` and SVG nodes before React hydration completes, causing React to detect a mismatch between SSR output and the DOM. Additionally, the client-side/state approach (or explicit-locale/ISO approach) mismatches if the server and client locales differ.
fix: Add `suppressHydrationWarning` to the `<html>` tag, to all `lucide-react` icons in the Sidebar and TopBar, and to the Date element in the TopBar.
verification: Verified that the fix builds cleanly. Needs manual verification in the browser with Dark Reader enabled.
files_changed: 
- `src/app/layout.tsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/TopBar.jsx`
