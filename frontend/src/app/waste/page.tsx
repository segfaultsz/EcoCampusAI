'use client';
import WasteStackedBar from '@/components/waste/WasteStackedBar';
import WasteTable from '@/components/waste/WasteTable';
import DiversionGauge from '@/components/waste/DiversionGauge';
import WasteTrendChart from '@/components/waste/WasteTrendChart';
import WastePieChart from '@/components/waste/WastePieChart';

export default function WastePage() {
  return (
    <div className="space-y-6">
      <div className="dashboard-card p-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Daily Waste Collection</h2>
        <WasteStackedBar />
      </div>

      <div className="dashboard-card p-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Building-wise Waste</h2>
        <WasteTable />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Waste Diversion Rate</h2>
          <DiversionGauge />
        </div>
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Monthly Waste Trend</h2>
          <WasteTrendChart />
        </div>
      </div>

      <div className="dashboard-card p-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Waste Composition</h2>
        <WastePieChart />
      </div>
    </div>
  );
}
