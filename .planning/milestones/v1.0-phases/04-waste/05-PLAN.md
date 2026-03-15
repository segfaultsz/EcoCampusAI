---
phase: 04-waste
plan: 05
type: execute
wave: 1
depends_on: ["04"]
files_modified:
  - frontend/src/app/waste/page.tsx
  - frontend/src/components/waste/WasteStackedBar.jsx
  - frontend/src/components/waste/DiversionGauge.jsx
  - frontend/src/components/waste/WasteTrendChart.jsx
  - frontend/src/components/waste/WastePieChart.jsx
  - frontend/src/components/waste/WasteTable.jsx
autonomous: true
requirements: ["WAST-01", "WAST-03", "WAST-04", "WAST-05"]
gap_closure: true
must_haves:
  truths:
    - "All visualizations update when building filter changes"
    - "Waste composition pie chart with interactive legend (click to toggle)"
  artifacts:
    - path: "frontend/src/app/waste/page.tsx"
      provides: "Building filter state and UI"
    - path: "frontend/src/components/waste/WastePieChart.jsx"
      provides: "Interactive legend functionality"
  key_links:
    - from: "frontend/src/app/waste/page.tsx"
      to: "Chart Components"
      via: "passing building prop"
---

<objective>
Close gaps identified in Waste Management phase verification.

Purpose: Ensure building filter applies to all visualizations and pie chart legend is interactive.
Output: Updated page and components accepting filter prop, and interactive legend.
</objective>

<execution_context>
@E:/WorkSpace/Appathon/.planning/milestones/v1.0-phases/04-waste/04-SUMMARY.md
</execution_context>

<context>
@frontend/src/app/waste/page.tsx
@frontend/src/components/waste/WasteStackedBar.jsx
@frontend/src/components/waste/DiversionGauge.jsx
@frontend/src/components/waste/WasteTrendChart.jsx
@frontend/src/components/waste/WastePieChart.jsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add building filter to page.tsx</name>
  <files>frontend/src/app/waste/page.tsx</files>
  <action>
    Add building filter UI (a select dropdown) and state to `page.tsx`.
    Pass the `building` prop down to `WasteStackedBar`, `WasteTable`, `DiversionGauge`, `WasteTrendChart`, and `WastePieChart`.
    
    Reference existing code: currently `page.tsx` renders these components without props.
    Gap reason: Building filter is completely missing from the Waste page, and visualization components do not accept or react to a building prop.
  </action>
  <verify>
    <automated>grep -E -q "\bbuilding=" frontend/src/app/waste/page.tsx</automated>
  </verify>
  <done>Building filter exists and passes prop to child components</done>
</task>

<task type="auto">
  <name>Task 2: Update charts to react to building prop</name>
  <files>frontend/src/components/waste/WasteStackedBar.jsx, frontend/src/components/waste/DiversionGauge.jsx, frontend/src/components/waste/WasteTrendChart.jsx</files>
  <action>
    Modify `WasteStackedBar`, `DiversionGauge`, and `WasteTrendChart` to accept a `building` prop.
    Update the mock data generation inside these components to use the `building` prop (e.g. recalculate data when the prop changes) so that visualizations update when the filter changes.
    
    Gap reason: Components do not accept or react to a building prop.
  </action>
  <verify>
    <automated>grep -q "building" frontend/src/components/waste/WasteStackedBar.jsx</automated>
  </verify>
  <done>Charts accept building prop and update their mock data based on it</done>
</task>

<task type="auto">
  <name>Task 3: Make WastePieChart legend interactive</name>
  <files>frontend/src/components/waste/WastePieChart.jsx</files>
  <action>
    Add state to track hidden slices.
    Add an `onClick` handler to the Recharts `Legend` to toggle visibility of slices.
    Filter the data or set values to 0 for hidden slices before rendering the Pie chart.
    Ensure it also accepts the `building` prop and updates data accordingly.
    
    Gap reason: WastePieChart uses default Recharts Legend without the onClick handler or state needed to toggle slices.
  </action>
  <verify>
    <automated>grep -q "onClick" frontend/src/components/waste/WastePieChart.jsx</automated>
  </verify>
  <done>Pie chart legend is interactive and data updates when building changes</done>
</task>

</tasks>

<verification>
Check if building filter exists and charts update when selected building changes.
Check if clicking legend items on the pie chart toggles the slices.
</verification>

<success_criteria>
All charts receive and use the building prop.
WastePieChart legend is clickable and toggles slice visibility.
</success_criteria>

<output>
After completion, create `.planning/milestones/v1.0-phases/04-waste/04-waste-05-SUMMARY.md`
</output>
