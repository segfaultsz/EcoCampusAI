# Quick Task 3: Replace Campus Buildings

## Goal
Replace 10 old campus buildings with 11 new ones across Supabase, Backend (Python scripts), and Frontend (page.js).

## Work Completed
- **Backend:** Updated `backend/data/generate_synthetic.py` to replace old building definitions with the 11 new buildings. Regenerated the synthetic data.
- **Backend:** Checked `backend/app/services/data_service.py` and `backend/data/seed_database.py` and updated any hardcoded references.
- **Frontend:** Updated `BUILDING_COORDS` and `CAMPUS_CENTER` in `frontend/src/app/campus/page.js` to match the 11 new buildings with placeholder coordinates.

## Result
Codebase updated to use the new 11 buildings. Data seeding logic is ready. Frontend correctly references the new building codes.