---
phase: quick-fix-errors
plan: 7
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/.env.local
  - frontend/.gitignore
  - frontend/src/app/api/solar/route.js
  - frontend/src/app/api/sunrise/route.js
  - frontend/src/app/api/energy/hourly/route.js
autonomous: true
requirements: [DASH-03, UI-05, INT-02]
must_haves:
  truths:
    - "Campus map API returns valid data (200 OK) instead of 500"
    - "Solar widget displays irradiance data instead of 'unavailable'"
    - "Sunrise widget displays sunrise/sunset times instead of 'unavailable'"
    - "Energy chart displays hourly data instead of 'Connection failed'"
    - "All fallback data is generated locally when backend is unreachable"
  artifacts:
    - path: "frontend/.env.local"
      provides: "Configuration with Supabase URL, service key, Python API URL"
      exists: true
    - path: "frontend/src/app/api/solar/route.js"
      provides: "Solar API endpoint with fallback data in catch block"
      exports: ["GET"]
      contains: "irradiance_wm2"
    - path: "frontend/src/app/api/sunrise/route.js"
      provides: "Sunrise API endpoint with fallback data in catch block"
      exports: ["GET"]
      contains: "sunrise, sunset"
    - path: "frontend/src/app/api/energy/hourly/route.js"
      provides: "Energy hourly API endpoint with 24-element array fallback"
      exports: ["GET"]
      contains: "for (let i = 0; i < 24"
  key_links:
    - from: "frontend/src/app/api/solar/route.js"
      to: "process.env.NEXT_PUBLIC_PYTHON_API_URL"
      via: "fetch to backend with fallback"
      pattern: "catch.*irradiance_wm2"
    - from: "frontend/src/app/api/sunrise/route.js"
      to: "process.env.NEXT_PUBLIC_PYTHON_API_URL"
      via: "fetch to backend with fallback"
      pattern: "catch.*sunrise.*sunset"
    - from: "frontend/src/app/api/energy/hourly/route.js"
      to: "process.env.NEXT_PUBLIC_PYTHON_API_URL"
      via: "fetch to backend with fallback"
      pattern: "catch.*for \\(let i = 0; i < 24"
---

<objective>
Implement all 4 critical fixes from gsd_fix_errors.toon to restore functionality to broken widgets and API routes

Purpose: The campus map is blank, solar/sunrise widgets show "unavailable", and energy chart shows "Connection failed" because API routes return 503/500 errors when backend is unreachable. These fixes add graceful fallback data so the UI remains functional even without a live backend.

Output: 5 files modified/created with fallback data strategies
</objective>

<execution_context>
@C:/Users/omkar/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/omkar/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create frontend/.env.local and verify .gitignore</name>
  <files>
    frontend/.env.local
    frontend/.gitignore
  </files>
  <action>
    Create new file frontend/.env.local with exact 4-line content (no extra lines, no comments):
    - NEXT_PUBLIC_SUPABASE_URL=https://ogvlyrppybsmgcakizac.supabase.co
    - SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndmx5cnBweWJzbWdjYWtpemFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxNDQ3MSwiZXhwIjoyMDg4ODkwNDcxfQ.xQKdtanuvg43MQo8KV216A6Uc1jwqedMEDkidZhDYuA
    - NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
    - NEXT_PUBLIC_MAPBOX_TOKEN=
    
    Then check frontend/.gitignore exists and contains `.env.local`. If missing, append `.env.local` on a new line at end of file.
  </action>
  <verify>
    <automated>cat frontend/.env.local | wc -l</automated> outputs 4
    <automated>grep -q ".env.local" frontend/.gitignore</automated> returns 0
  </verify>
  <done>frontend/.env.local exists with exactly 4 env vars; .gitignore contains .env.local</done>
</task>

<task type="auto">
  <name>Task 2: Fix solar, sunrise, and energy/hourly API routes with fallback data</name>
  <files>
    frontend/src/app/api/solar/route.js
    frontend/src/app/api/sunrise/route.js
    frontend/src/app/api/energy/hourly/route.js
  </files>
  <action>
    Replace ENTIRE contents of each file with the specified fallback versions from gsd_fix_errors.toon:

    solar/route.js: Replace with version that returns mock solar data object (irradiance_wm2, cloud_cover_pct, temp_c, timestamp, source='fallback') in catch block.

    sunrise/route.js: Replace with version that returns mock sunrise/sunset object (sunrise, sunset, day_length_hrs, solar_noon, source='fallback') with today's date.

    energy/hourly/route.js: Replace with version that generates 24-hour array with hour, kwh, predicted, temp fields using for-loop; each element has realistic base values with sinusoidal variation and random noise.

    Ensure each file is the exact copy-paste content provided (verify line counts: solar=17 lines, sunrise=19 lines, energy=30 lines).
  </action>
  <verify>
    <automated>wc -l frontend/src/app/api/solar/route.js</automated> outputs 17
    <automated>grep -q "irradiance_wm2" frontend/src/app/api/solar/route.js</automated> returns 0
    <automated>wc -l frontend/src/app/api/sunrise/route.js</automated> outputs 19
    <automated>grep -q "sunrise.*sunset" frontend/src/app/api/sunrise/route.js</automated> returns 0
    <automated>wc -l frontend/src/app/api/energy/hourly/route.js</automated> outputs 30
    <automated>grep -q "for (let i = 0; i < 24" frontend/src/app/api/energy/hourly/route.js</automated> returns 0
  </verify>
  <done>All three route files replaced with exact fallback versions; line counts match; fallback data structures present</done>
</task>

</tasks>

<verification>
After both tasks complete, run the test commands from gsd_fix_errors.toon:
- curl http://localhost:3000/api/solar → returns {irradiance_wm2, ...} with 200 status
- curl http://localhost:3000/api/sunrise → returns {sunrise, sunset, ...} with 200 status
- curl http://localhost:3000/api/energy/hourly → returns array of 24 objects with 200 status
- Campus map no longer returns 500 (verify by loading map page)
- All widgets display data instead of "unavailable" messages
</verification>

<success_criteria>
- frontend/.env.local exists with exactly 4 lines
- .gitignore contains .env.local entry
- All three API route files replaced with correct fallback implementations
- Each curl command returns HTTP 200 with expected JSON structure
- UI widgets (solar, sunrise, energy chart) display real-looking data
- Campus map loads without crash (handled by existing token guard)
- No 503 or 500 errors on any of the fixed endpoints
</success_criteria>

<output>
After completion, create `.planning/phases/quick-fix-errors/quick-7-SUMMARY.md`
</output>
