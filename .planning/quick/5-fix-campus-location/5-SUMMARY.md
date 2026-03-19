---
phase: 5-fix-campus-location
plan: 5
subsystem: "campus-location"
tags: ["frontend", "map", "coordinates", "ui"]
depends_on: []
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - frontend/src/app/campus/page.js
    - frontend/src/components/layout/TopBar.jsx
decisions:
  - "Updated frontend map configuration to use accurate NIST real GPS coordinates."
  - "Replaced old university and location placeholder strings with NIST, Palur Hills."
metrics:
  duration: 2m
  completed_date: "2026-03-19"
---

# Phase 5 Plan 5: Fix Campus Location Summary

Updated campus locations to precisely point to NIST, Palur Hills in the frontend map component, and revised UI headers to accurately represent the newly placed location.

## Tasks Completed
- **Task 3: Update frontend map component** - Updated `CAMPUS_CENTER` to `[84.74472, 19.19917]`, modified map zoom level to `16.5`, and updated `BUILDING_COORDS` with exact mapping to NIST locations.
- **Task 4: Update UI Labels** - Replaced the "GreenTech University" string with "NIST, Palur Hills" inside the `TopBar` component.
- **Task 5: Global sweep for stale coordinates** - Verified the entire codebase using regex patterns `88.36`, `22.57`, `85.82`, and `20.29` ensuring no lingering coordinates remain in python scripts, frontend source, and env variables.

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
FOUND: frontend/src/app/campus/page.js
FOUND: frontend/src/components/layout/TopBar.jsx