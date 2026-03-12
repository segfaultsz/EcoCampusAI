'use client';
import WasteStackedBar from '@/components/waste/WasteStackedBar';
import WasteTable from '@/components/waste/WasteTable';
import DiversionGauge from '@/components/waste/DiversionGauge';
import WasteTrendChart from '@/components/waste/WasteTrendChart';
import WastePieChart from '@/components/waste/WastePieChart';

export default function WastePage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Daily Waste Collection</h2>
        <WasteStackedBar />
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Building-wise Waste</h2>
        <WasteTable />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Waste Diversion Rate</h2>
          <DiversionGauge />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Monthly Waste Trend</h2>
          <WasteTrendChart />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Waste Composition</h2>
        <WastePieChart />
      </div>
    </div>
  );
}
