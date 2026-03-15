---
task: 2
description: "Campus Map Upgrade: Mapbox Standard + 3D + Dynamic Lighting"
date: "2026-03-15"
status: completed
---

# Quick Task 2 Summary: Campus Map Upgrade

## Objective Achieved
Successfully upgraded the campus map from a 2D satellite style to **Mapbox Standard**, featuring native 3D buildings, dynamic lighting, and atmosphere effects aligned with the "Meevis" dark theme.

## Tasks Completed
- ✅ Updated `mapbox-gl` to version 3.20.0 to support Mapbox Standard features.
- ✅ Replaced the entire map initialization in `campus/page.js` with the Mapbox Standard configuration.
- ✅ Implemented a monochrome dark basemap theme with native 3D extruded buildings.
- ✅ Added an interactive energy consumption heatmap layer with color-coded halo glow and dots.
- ✅ Created a dynamic lighting system that automatically cycles between dawn, day, dusk, and night based on the current time (IST).
- ✅ Added a manual lighting preset switcher UI below the map.
- ✅ Overrode Mapbox default popup and control styles in `globals.css` to match the project's dark dashboard aesthetic.

## Technical Details
- Used `map.setConfigProperty` to manage Standard style settings (theme, lightPreset, POI visibility).
- Implemented GeoJSON source and circle layers (`energy-glow` and `energy-dots`) with property-based color interpolation.
- Created custom HTML popups using `Urbanist` font and project design tokens.

## Self-Check: PASSED
- [x] Map loads with monochrome style
- [x] 3D buildings are visible
- [x] Energy halos render correctly
- [x] Lighting switcher updates the map state
- [x] All default Mapbox chrome is hidden/styled dark
