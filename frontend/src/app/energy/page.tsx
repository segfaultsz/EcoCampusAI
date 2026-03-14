'use client';
import { useState } from 'react';
import EnergyDetailChart from '@/components/energy/EnergyDetailChart';
import HeatmapChart from '@/components/energy/HeatmapChart';
import PeakPredictionCard from '@/components/energy/PeakPredictionCard';
import ComparisonChart from '@/components/energy/ComparisonChart';
import AnomalyTimeline from '@/components/energy/AnomalyTimeline';

const buildings = [
  { code: 'CSE', name: 'Computer Science Block' },
  { code: 'ECE', name: 'Electronics Block' },
  { code: 'LIB', name: 'Central Library' },
  { code: 'ADM', name: 'Admin Building' },
  { code: 'MEC', name: 'Mechanical Workshop' },
  { code: 'HOS1', name: 'Boys Hostel A' },
  { code: 'HOS2', name: 'Girls Hostel B' },
  { code: 'CAF', name: 'Cafeteria Complex' },
  { code: 'SPT', name: 'Sports Complex' },
  { code: 'SCI', name: 'Science Block' },
];

export default function EnergyPage() {
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '2026-03-05', end: '2026-03-12' });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="dashboard-card p-4 flex flex-wrap gap-6 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">Building:</label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="rounded border border-gray-700 bg-dark-800 px-3 py-2 text-gray-200 focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="rounded border border-gray-700 bg-dark-800 px-3 py-2 text-gray-200"
          />
          <label className="text-sm text-gray-400">To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="rounded border border-gray-700 bg-dark-800 px-3 py-2 text-gray-200"
          />
        </div>
      </div>

      {/* Main Chart */}
      <div className="dashboard-card p-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Hourly Consumption</h2>
        <EnergyDetailChart building={selectedBuilding} dateRange={dateRange} />
      </div>

      {/* Heatmap */}
      <div className="dashboard-card p-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Usage Heatmap (Day × Hour)</h2>
        <HeatmapChart building={selectedBuilding} dateRange={dateRange} />
      </div>

      {/* Peak Prediction and Comparison */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Peak Prediction</h2>
          <PeakPredictionCard building={selectedBuilding} />
        </div>
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Historical Comparison</h2>
          <ComparisonChart building={selectedBuilding} />
        </div>
      </div>

      {/* Anomaly Timeline */}
      <div className="dashboard-card p-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Detected Anomalies</h2>
        <AnomalyTimeline building={selectedBuilding} />
      </div>
    </div>
  );
}
