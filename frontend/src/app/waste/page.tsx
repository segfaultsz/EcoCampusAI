'use client';
import { useState } from 'react';
import WasteStackedBar from '@/components/waste/WasteStackedBar';
import WasteTable from '@/components/waste/WasteTable';
import DiversionGauge from '@/components/waste/DiversionGauge';
import WasteTrendChart from '@/components/waste/WasteTrendChart';
import WastePieChart from '@/components/waste/WastePieChart';

export default function WastePage() {
  const [building, setBuilding] = useState('All Buildings');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Waste Management</h1>
        <select
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="All Buildings">All Buildings</option>
          <option value="Main Building">Main Building</option>
          <option value="Science Block">Science Block</option>
          <option value="Library">Library</option>
          <option value="Sports Complex">Sports Complex</option>
          <option value="Hostel A">Hostel A</option>
        </select>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Daily Waste Collection</h2>
        <WasteStackedBar building={building} />
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Building-wise Waste</h2>
        <WasteTable building={building} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Waste Diversion Rate</h2>
          <DiversionGauge building={building} />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Monthly Waste Trend</h2>
          <WasteTrendChart building={building} />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Waste Composition</h2>
        <WastePieChart building={building} />
      </div>
    </div>
  );
}