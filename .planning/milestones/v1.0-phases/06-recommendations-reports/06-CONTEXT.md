# Phase 6: Recommendations & Reports - Context

## Objective
Build the Recommendations and Reports pages. The Recommendations page will list AI-generated suggestions as interactive cards and display savings/carbon impact summaries. The Reports page will allow users to filter data and generate/export PDF and CSV summaries.

## Requirements Addressed
- **REC-01**: Recommendations page shows active suggestions as cards in grid layout
- **REC-02**: Each recommendation card includes: title, description, priority badge, category icon, estimated savings (₹/month and kWh), CO2 reduction, status dropdown (Pending/Implemented/Dismissed)
- **REC-03**: Status change triggers PATCH API call to update recommendation (mocked for now)
- **REC-04**: Savings summary displays cumulative savings from implemented recommendations
- **REC-05**: Carbon impact equivalence shows tree count and car trips equivalent
- **RPRT-01**: Reports page with date range selector (from/to) and building filter (multi-select or All)
- **RPRT-02**: Report preview section shows summary metrics, key charts, top anomalies, active recommendations
- **RPRT-03**: PDF export functionality (download PDF / window.print)
- **RPRT-04**: CSV export functionality (download CSV)

## Success Criteria
1. Recommendations page shows list of suggestion cards in responsive grid
2. Each recommendation card includes: title, description (expandable), priority badge (High red, Medium amber, Low green), category icon (Energy ⚡, Waste 🗑️, Carbon 🌍), estimated savings (₹/month and kWh), CO2 reduction, status dropdown (Pending/Implemented/Dismissed)
3. Status change triggers mock state update (mocking the PATCH call)
4. Savings summary displays total ₹ from implemented recommendations
5. Carbon equivalence shows "Equivalent to planting X trees" and "X cars off road for a month"
6. Reports page: date range pickers, building multi-select (or All), preview section with summary metrics, charts, anomalies, recommendations
7. PDF export uses window.print() with print-friendly CSS
8. CSV export generates and downloads CSV from mock data

## Technical Approach
- All data will be mocked in this phase.
- Use Tailwind CSS for styling and Recharts if any new charts are needed in the report preview.
- Ensure responsive design and adherence to the project's design tokens (glass-card, dark theme).