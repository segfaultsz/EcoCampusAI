---
phase: 09-aqi-energy-fixes
plan: 02
subsystem: frontend
tags: [mapbox, map, error-handling, resilience]
dependency_graph:
  requires: []
  provides: [resilient-map]
  affects: [campus-map]
tech-stack:
  added: []
  patterns: [error-guard, graceful-fallback]
key-files:
  created: []
  modified:
    - frontend/src/app/campus/page.js
decisions:
  - Switch Mapbox style to 'dark-v11' to avoid the v3.20 Standard style crash when token is missing/invalid.
  - Add explicit token guard and fallback UI in the CampusPage component.
metrics:
  duration: 15m
  completed_date: "2026-03-15"
---

# Phase 09 Plan 02: Campus Map Error Handling Summary

Fixed the Mapbox Standard style crash (`Could not load models: Cannot read properties of undefined (reading 'oak1-lod3')`) by implementing a robust error-handling strategy and switching to a more stable basemap style.

## Key Changes

### 1. Robust Token Guard
- Added check for `process.env.NEXT_PUBLIC_MAPBOX_TOKEN` before initializing the Mapbox instance.
- Prevents Mapbox GL JS from attempting to authenticate with an undefined token, which was the root cause of the crash.

### 2. Style Switch to `dark-v11`
- Switched from `mapbox://styles/mapbox/standard` to `mapbox://styles/mapbox/dark-v11`.
- The Standard style (v3.20+) aggressively loads 3D vegetation models (like `oak1-lod3`) from authenticated endpoints. When auth fails, it crashes the renderer.
- `dark-v11` provides a similar dark aesthetic without the heavy 3D model dependencies.

### 3. Manual 3D Building Extrusions
- Re-implemented 3D building extrusions using the `fill-extrusion` layer type on the `composite` source.
- This restores the 3D look while maintaining the performance and stability of the dark-v11 style.

### 4. Graceful Fallback UI
- Added a "Campus Map Unavailable" message in the JSX that appears if the token is missing.
- Provides clear instructions to the user on how to enable the map by setting the environment variable in `.env.local`.

### 5. Runtime Error Resilience
- Wrapped map creation in a `try/catch` block.
- Added a Mapbox `error` event listener to log non-fatal runtime errors without crashing the entire page.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
- [x] `frontend/src/app/campus/page.js` modified
- [x] Commit `7d37fd6` exists
- [x] Crash root cause (oak1-lod3) addressed by style switch
- [x] Token guard implemented
- [x] Fallback UI implemented
