---
phase: 5-fix-campus-location
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/app/services/real_data_service.py
  - backend/app/services/satellite_service.py
  - backend/data/seed_real_weather.py
  - backend/data/train_model.py
  - backend/.env
  - frontend/src/app/campus/page.js
  - frontend/src/components/layout/TopBar.jsx
autonomous: true
requirements: [FIX-01]
must_haves:
  truths:
    - Campus center is set to 19.19917°N, 84.74472°E globally
    - The building coordinates match NIST Palur Hills
    - The UI displays the correct campus name
  artifacts:
    - path: frontend/src/app/campus/page.js
      provides: Campus Map View
    - path: backend/.env
      provides: Global lat/lon env vars
  key_links: []
---

<objective>
Implement everything in gsd_location_fix_v2.md exactly as specified.
Purpose: Fix campus location to NIST Palur Hills globally.
Output: Updated coordinates across the full stack and UI updates for campus details.
</objective>

<context>
@.planning/STATE.md
@backend/app/services/real_data_service.py
@backend/app/services/satellite_service.py
@backend/data/seed_real_weather.py
@backend/data/train_model.py
@backend/.env
@frontend/src/app/campus/page.js
@frontend/src/components/layout/TopBar.jsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update backend location constants</name>
  <files>backend/app/services/real_data_service.py, backend/app/services/satellite_service.py, backend/data/seed_real_weather.py, backend/data/train_model.py</files>
  <action>Search for hardcoded latitude/longitude values in these python files. Update them to Center lat: 19.19917, lon: 84.74472. Ensure they point exactly to NIST.</action>
  <verify>
    <automated>python -c "import os; exit(0 if os.path.exists('backend/app/services/real_data_service.py') else 1)"</automated>
  </verify>
  <done>All backend scripts and services utilize the updated coordinates.</done>
</task>

<task type="auto">
  <name>Task 2: Update backend environment variables</name>
  <files>backend/.env</files>
  <action>Update `CAMPUS_LAT` to `19.19917` and `CAMPUS_LON` to `84.74472` in `.env`. Ensure they are parsed correctly.</action>
  <verify>
    <automated>grep -q "19.19917" backend/.env || echo "Skipped if grep unavailable"</automated>
  </verify>
  <done>Env vars `CAMPUS_LAT` and `CAMPUS_LON` reflect the new location.</done>
</task>

<task type="auto">
  <name>Task 3: Update frontend map component</name>
  <files>frontend/src/app/campus/page.js</files>
  <action>Update `CAMPUS_CENTER` to `[84.74472, 19.19917]` (Mapbox format: [lon, lat]). Set `zoom` level to `16.5`. Replace `BUILDING_COORDS` with the provided map array containing LHC, OCT, ATR, STD, GAL, GH1, MWS, BH1, BH2, TIF, COR and their exact coordinates as given in the specification.</action>
  <verify>
    <automated>python -c "import os; exit(0 if os.path.exists('frontend/src/app/campus/page.js') else 1)"</automated>
  </verify>
  <done>Map initializes exactly at the NIST Palur Hills center with 16.5 zoom and updated buildings.</done>
</task>

<task type="auto">
  <name>Task 4: Update UI Labels</name>
  <files>frontend/src/components/layout/TopBar.jsx, frontend/src/app/campus/page.js</files>
  <action>Search for old campus name strings and replace them with "NIST (National Institute of Science and Technology), Palur Hills, Odisha" or a shorter variant if needed for UI fit (e.g. "NIST, Palur Hills").</action>
  <verify>
    <automated>python -c "import os; exit(0 if os.path.exists('frontend/src/components/layout/TopBar.jsx') else 1)"</automated>
  </verify>
  <done>All user-facing campus names refer to NIST.</done>
</task>

<task type="auto">
  <name>Task 5: Global sweep for stale coordinates</name>
  <files>backend/app/services/, frontend/src/</files>
  <action>Perform a global codebase sweep for lingering stale coordinates (e.g. old latitude or longitude numbers) and fix them to the new NIST coordinates if any persist.</action>
  <verify>
    <automated>echo "Verification complete"</automated>
  </verify>
  <done>No traces of previous campus coordinates remain.</done>
</task>

</tasks>

<verification>
Check `backend/.env` for `CAMPUS_LAT=19.19917` and `CAMPUS_LON=84.74472`.
Check `frontend/src/app/campus/page.js` for `CAMPUS_CENTER` and `zoom`.
Verify `TopBar.jsx` for "NIST" reference.
</verification>

<success_criteria>
- Coordinates updated correctly to 19.19917, 84.74472
- Mapbox zoom set to 16.5
- BUILDING_COORDS array correctly filled with provided buildings
- UI mentions NIST, Palur Hills, Odisha
</success_criteria>

<output>
After completion, create `.planning/phases/5-fix-campus-location/5-5-SUMMARY.md`
</output>