---
wave: 1
depends_on: ["05"]
files_modified:
  - frontend/src/app/recommendations/page.tsx
  - frontend/src/components/recommendations/RecommendationCard.jsx
  - frontend/src/components/recommendations/SavingsSummary.jsx
  - frontend/src/components/recommendations/CarbonImpact.jsx
  - frontend/src/app/reports/page.tsx
  - frontend/src/components/reports/ReportFilters.jsx
  - frontend/src/components/reports/ReportPreview.jsx
  - frontend/src/components/reports/ExportActions.jsx
autonomous: true
---

<plan>
<objective>Phase 6: Recommendations & Reports — Build suggestions grid and exportable report pages</objective>

<tasks>
  <task id="1">
    <title>Create Recommendations Page</title>
    <description>Create frontend/src/app/recommendations/page.tsx assembling the Recommendations UI: SavingsSummary, CarbonImpact, and a list of RecommendationCards.</description>
    <file_edits>
      <edit path="frontend/src/app/recommendations/page.tsx">'use client';
import { useState } from 'react';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import SavingsSummary from '@/components/recommendations/SavingsSummary';
import CarbonImpact from '@/components/recommendations/CarbonImpact';

const initialRecommendations = [
  { id: 1, title: 'Schedule HVAC shutdown at 6 PM in Science Block', description: 'The Science Block HVAC system runs continuously after hours. Scheduling a shutdown can save significant energy.', priority: 'High', category: 'Energy', savingsRs: 12000, savingsKwh: 1200, co2Reduction: 980, status: 'Pending' },
  { id: 2, title: 'Implement waste segregation drive', description: 'Waste diversion is below 40% in the Cafeteria. A segregation drive can improve recycling rates.', priority: 'Medium', category: 'Waste', savingsRs: 3000, savingsKwh: 0, co2Reduction: 150, status: 'Pending' },
  { id: 3, title: 'Replace 50 old fixtures with LEDs in Admin Building', description: 'Lighting in the Admin Building consumes 15% more than average. Upgrading to LEDs will yield long-term savings.', priority: 'Low', category: 'Energy', savingsRs: 5000, savingsKwh: 500, co2Reduction: 410, status: 'Implemented' },
];

export default function RecommendationsPage() {
  const [recs, setRecs] = useState(initialRecommendations);

  const handleStatusChange = (id, newStatus) => {
    setRecs(recs.map(r => r.id === id ? { ...r, status: newStatus } : r));
    // In Phase 7, this will be an API call
  };

  const implementedRecs = recs.filter(r => r.status === 'Implemented');
  const totalSavingsRs = implementedRecs.reduce((sum, r) => sum + r.savingsRs, 0);
  const totalCo2 = implementedRecs.reduce((sum, r) => sum + r.co2Reduction, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Savings Tracker</h2>
          <SavingsSummary totalSavingsRs={totalSavingsRs} />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Carbon Impact</h2>
          <CarbonImpact totalCo2={totalCo2} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Active Recommendations</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recs.map(rec => (
            <RecommendationCard key={rec.id} data={rec} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="2">
    <title>Build RecommendationCard</title>
    <description>Card displaying recommendation details with a status dropdown. Triggers onStatusChange.</description>
    <file_edits>
      <edit path="frontend/src/components/recommendations/RecommendationCard.jsx">'use client';
import { Zap, Trash2, Globe } from 'lucide-react';

export default function RecommendationCard({ data, onStatusChange }) {
  const { id, title, description, priority, category, savingsRs, savingsKwh, co2Reduction, status } = data;

  const priorityColors = { High: 'text-red-400 bg-red-500/20', Medium: 'text-yellow-400 bg-yellow-500/20', Low: 'text-green-400 bg-green-500/20' };
  const CategoryIcon = category === 'Energy' ? Zap : category === 'Waste' ? Trash2 : Globe;

  return (
    <div className="glass-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <CategoryIcon size={18} className="text-primary-400" />
            <span className="text-sm text-gray-400">{category}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[priority]}`}>{priority}</span>
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-3 hover:line-clamp-none transition-all">{description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-500">Est. Savings</div>
            <div className="font-semibold text-green-400">₹{savingsRs.toLocaleString()} /mo</div>
            <div className="text-xs text-gray-400">{savingsKwh} kWh</div>
          </div>
          <div>
            <div className="text-gray-500">CO₂ Reduction</div>
            <div className="font-semibold text-primary-400">{co2Reduction} kg</div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700 mt-auto">
        <select 
          value={status} 
          onChange={(e) => onStatusChange(id, e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:outline-none focus:border-primary-500 text-white"
        >
          <option value="Pending">Pending</option>
          <option value="Implemented">Implemented</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="3">
    <title>Build SavingsSummary and CarbonImpact</title>
    <description>Two simple components to show aggregated metrics based on Implemented recommendations.</description>
    <file_edits>
      <edit path="frontend/src/components/recommendations/SavingsSummary.jsx">'use client';
export default function SavingsSummary({ totalSavingsRs }) {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-center">
        <div className="text-4xl font-bold text-green-400">₹{totalSavingsRs.toLocaleString()}</div>
        <div className="text-sm text-gray-400 mt-2">Cumulative monthly savings realized</div>
      </div>
    </div>
  );
}</edit>
      <edit path="frontend/src/components/recommendations/CarbonImpact.jsx">'use client';
export default function CarbonImpact({ totalCo2 }) {
  const trees = Math.floor(totalCo2 / 22); // ~22kg CO2 per tree/year
  const carMiles = Math.floor(totalCo2 * 2.5); // ~2.5 miles per kg CO2

  return (
    <div className="flex flex-col justify-center h-32 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <span className="text-gray-400">Total CO₂ Avoided</span>
        <span className="font-semibold text-primary-400">{totalCo2.toLocaleString()} kg</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Equivalent Trees Planted 🌳</span>
        <span className="font-bold">{trees} trees</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Miles not driven 🚗</span>
        <span className="font-bold">{carMiles.toLocaleString()} miles</span>
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="4">
    <title>Create Reports Page</title>
    <description>Create frontend/src/app/reports/page.tsx combining filters, export actions, and the report preview.</description>
    <file_edits>
      <edit path="frontend/src/app/reports/page.tsx">'use client';
import { useState } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportActions from '@/components/reports/ExportActions';
import ReportPreview from '@/components/reports/ReportPreview';

export default function ReportsPage() {
  const [filters, setFilters] = useState({ dateRange: 'Last 30 Days', building: 'All Buildings' });

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">Generate Reports</h2>
          <p className="text-sm text-gray-400">Select parameters to view and export your campus sustainability report.</p>
        </div>
        <ExportActions filters={filters} />
      </div>

      <div className="glass-card p-6">
        <ReportFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* The printable area */}
      <div id="report-print-area" className="glass-card p-8 bg-slate-900">
        <ReportPreview filters={filters} />
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="5">
    <title>Build Report Components</title>
    <description>Build ReportFilters, ReportPreview (showing mocked metrics based on filters), and ExportActions (handles CSV download and print window).</description>
    <file_edits>
      <edit path="frontend/src/components/reports/ReportFilters.jsx">'use client';
export default function ReportFilters({ filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
        <select 
          value={filters.dateRange} 
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Semester</option>
          <option>Year to Date</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-400 mb-2">Building</label>
        <select 
          value={filters.building} 
          onChange={(e) => setFilters({ ...filters, building: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
        >
          <option>All Buildings</option>
          <option>Science Block</option>
          <option>Computer Science</option>
          <option>Library</option>
        </select>
      </div>
    </div>
  );
}</edit>
      <edit path="frontend/src/components/reports/ReportPreview.jsx">'use client';
export default function ReportPreview({ filters }) {
  return (
    <div className="space-y-8 text-white">
      <div className="text-center border-b border-slate-700 pb-6">
        <h1 className="text-3xl font-bold text-primary-400">EcoCampus Sustainability Report</h1>
        <p className="text-lg mt-2">{filters.building} | {filters.dateRange}</p>
        <p className="text-sm text-gray-400 mt-1" suppressHydrationWarning>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Total Energy</div>
          <div className="text-2xl font-bold">145,200 kWh</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Total Waste</div>
          <div className="text-2xl font-bold">8,450 kg</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Carbon Footprint</div>
          <div className="text-2xl font-bold">119,064 kg CO₂</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Active Anomalies</div>
          <div className="text-2xl font-bold text-red-400">3</div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Executive Summary</h3>
        <p className="text-gray-300 leading-relaxed">
          During the selected period ({filters.dateRange}), {filters.building} showed typical usage patterns with a few notable exceptions. 
          Energy consumption peaked during mid-day hours, aligning with maximum occupancy. 
          Waste diversion rates remain stable but highlight an opportunity for increased recycling initiatives.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Top Recommendations</h3>
        <ul className="list-disc pl-5 text-gray-300 space-y-2">
          <li>Schedule HVAC shutdown at 6 PM in Science Block (Est. Savings: ₹12,000/mo)</li>
          <li>Implement waste segregation drive to improve diversion past 40%</li>
        </ul>
      </div>
    </div>
  );
}</edit>
      <edit path="frontend/src/components/reports/ExportActions.jsx">'use client';
import { Download, FileText } from 'lucide-react';

export default function ExportActions({ filters }) {
  const handlePrint = () => {
    window.print();
  };

  const handleCSV = () => {
    // Mock CSV generation
    const csvContent = "Metric,Value\nTotal Energy,145200\nTotal Waste,8450\nCarbon Footprint,119064";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `EcoCampus_Report_${filters.dateRange.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-3">
      <button 
        onClick={handleCSV}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
      >
        <Download size={16} />
        <span className="text-sm font-medium">CSV</span>
      </button>
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        <FileText size={16} />
        <span className="text-sm font-medium">PDF Print</span>
      </button>
    </div>
  );
}</edit>
    </file_edits>
  </task>
</tasks>

<verification>
  <must_have id="vh-1">Recommendations page renders with list of cards and summaries</must_have>
  <must_have id="vh-2">RecommendationCards can change status and update state</must_have>
  <must_have id="vh-3">SavingsSummary and CarbonImpact reflect implemented totals</must_have>
  <must_have id="vh-4">Reports page renders with filters and preview</must_have>
  <must_have id="vh-5">Export actions successfully trigger window.print and CSV download</must_have>
</verification>
</plan>