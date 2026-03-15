# Phase 6: Recommendations & Reports - Summary

**Status:** Completed
**Date:** 2026-03-13

## What was built
1. **Recommendations Page** (`frontend/src/app/recommendations/page.tsx`): Main wrapper page combining the active recommendation cards and high-level summaries.
2. **RecommendationCard** (`frontend/src/components/recommendations/RecommendationCard.jsx`): Interactive card displaying an AI suggestion, its estimated savings, CO2 reduction, and a status toggle.
3. **SavingsSummary** (`frontend/src/components/recommendations/SavingsSummary.jsx`): A prominent display of cumulative financial savings from implemented recommendations.
4. **CarbonImpact** (`frontend/src/components/recommendations/CarbonImpact.jsx`): A high-level visual showing the CO2 avoided in terms of equivalent trees planted and car miles not driven.
5. **Reports Page** (`frontend/src/app/reports/page.tsx`): Main wrapper page for the reporting tool allowing date and building filtration alongside export options.
6. **ReportFilters** (`frontend/src/components/reports/ReportFilters.jsx`): Dropdowns to filter report data by date range and specific campus building.
7. **ReportPreview** (`frontend/src/components/reports/ReportPreview.jsx`): The core printable view summarizing energy, waste, carbon footprint, active anomalies, and top recommendations.
8. **ExportActions** (`frontend/src/components/reports/ExportActions.jsx`): Action buttons facilitating in-browser PDF printing and CSV mock data generation.

All features are fully responsive and wired up using simulated (mock) local state in preparation for real API integration in Phase 7.