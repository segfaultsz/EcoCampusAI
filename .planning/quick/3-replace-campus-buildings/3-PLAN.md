---
phase: 3-replace-campus-buildings
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/data/generate_synthetic.py
  - backend/app/services/data_service.py
  - backend/data/seed_database.py
  - frontend/src/app/campus/page.js
autonomous: true
requirements: [REQ-ALL]
must_haves:
  truths:
    - "New buildings are correctly defined in backend scripts"
    - "Old buildings are completely removed from backend generation and seeding"
    - "Frontend campus map reflects the new buildings and coordinates"
  artifacts:
    - path: "backend/data/generate_synthetic.py"
      provides: "Data generation script"
    - path: "backend/app/services/data_service.py"
      provides: "Data service"
    - path: "backend/data/seed_database.py"
      provides: "Database seeding"
    - path: "frontend/src/app/campus/page.js"
      provides: "Campus map page"
  key_links:
    - from: "backend/data/generate_synthetic.py"
      to: "generated_data"
      via: "New building definitions"
    - from: "frontend/src/app/campus/page.js"
      to: "ui"
      via: "Updated BUILDING_COORDS"
---

<objective>
Replace 10 old campus buildings with 11 new ones across Supabase, Backend (Python scripts), and Frontend (page.js).

Purpose: Update the campus map and underlying data infrastructure to reflect the correct, updated list of buildings.
Output: Updated Python scripts for backend data generation/seeding and updated frontend React component.
</objective>

<execution_context>
</execution_context>

<context>
@backend/data/generate_synthetic.py
@backend/app/services/data_service.py
@backend/data/seed_database.py
@frontend/src/app/campus/page.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace building definitions in backend data generator</name>
  <files>backend/data/generate_synthetic.py</files>
  <action>
    Locate the building definitions array/dictionary in `backend/data/generate_synthetic.py` (which likely defines the old 10 buildings). Replace them with the 11 new buildings:
    - LHC: Lecture Hall Complex (academic, 18000 sqft, AC: yes, kWh/day: 280-350)
    - GAL: Galleria (amenity, 10000 sqft, AC: yes, kWh/day: 180-250)
    - ATR: Atrium (admin, 9000 sqft, AC: yes, kWh/day: 150-200)
    - COR: Core (academic, 14000 sqft, AC: yes, kWh/day: 260-330)
    - TIF: Tifac (lab, 12000 sqft, AC: yes, kWh/day: 300-400)
    - STD: Indoor Stadium (amenity, 30000 sqft, AC: no, kWh/day: 80-120)
    - BH1: Boys Hostel 1 (hostel, 25000 sqft, AC: partial, kWh/day: 200-280)
    - BH2: Boys Hostel 2 (hostel, 22000 sqft, AC: partial, kWh/day: 180-260)
    - GH1: Girls Hostel (hostel, 22000 sqft, AC: partial, kWh/day: 180-260)
    - MWS: Mechanical Workshop (lab, 18000 sqft, AC: partial, kWh/day: 400-500)
    - OCT: Octagon (amenity, 15000 sqft, AC: yes, kWh/day: 250-320)
    Ensure attributes match the script's format (e.g., area, type, ac, base_kwh).
  </action>
  <verify>
    <automated>python -c "import sys; content=open('backend/data/generate_synthetic.py').read(); sys.exit(0 if 'Lecture Hall Complex' in content else 1)"</automated>
  </verify>
  <done>Building definitions are completely swapped to the new 11 buildings in generate_synthetic.py</done>
</task>

<task type="auto">
  <name>Task 2: Replace building references in backend service and seed scripts</name>
  <files>backend/app/services/data_service.py, backend/data/seed_database.py</files>
  <action>
    Search for old building codes/names in `backend/app/services/data_service.py` and `backend/data/seed_database.py`. Replace any hardcoded building references, mock data, or building lists with the new 11 buildings (LHC, GAL, ATR, COR, TIF, STD, BH1, BH2, GH1, MWS, OCT).
    Ensure the data models used for seeding correctly reflect the new building structure and attributes.
  </action>
  <verify>
    <automated>python -c "import sys; import os; content1=open('backend/app/services/data_service.py').read() if os.path.exists('backend/app/services/data_service.py') else ''; content2=open('backend/data/seed_database.py').read() if os.path.exists('backend/data/seed_database.py') else ''; sys.exit(0 if 'LHC' in content1 or 'LHC' in content2 else 1)"</automated>
  </verify>
  <done>All backend scripts (data_service.py and seed_database.py) have been updated to reference only the new buildings.</done>
</task>

<task type="auto">
  <name>Task 3: Update BUILDING_COORDS in frontend</name>
  <files>frontend/src/app/campus/page.js</files>
  <action>
    Open `frontend/src/app/campus/page.js` and locate the `BUILDING_COORDS` constant (or similar building list). Replace the old building coordinates/data with the 11 new buildings. You may need to assign approximate coordinates or update the list structure to match the frontend expectations, maintaining the exact codes (LHC, GAL, ATR, etc.) and names as specified. Ensure old buildings are entirely removed.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const content=fs.readFileSync('frontend/src/app/campus/page.js', 'utf8'); process.exit(content.includes('Lecture Hall Complex') ? 0 : 1)"</automated>
  </verify>
  <done>BUILDING_COORDS in page.js reflects the 11 new campus buildings and old ones are removed.</done>
</task>

</tasks>

<verification>
Ensure Python code has no syntax errors using standard python tools. Check if frontend compiles/runs properly.
</verification>

<success_criteria>
- generate_synthetic.py has the new 11 buildings.
- data_service.py references the new buildings.
- seed_database.py is ready to seed the 11 new buildings.
- frontend/src/app/campus/page.js lists the new buildings in BUILDING_COORDS.
</success_criteria>

<output>
After completion, create `.planning/phases/3-replace-campus-buildings/3-replace-campus-buildings-3-SUMMARY.md`
</output>