'use client';
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

  const handleStatusChange = (id: number | string, newStatus: string) => {
    setRecs(recs.map(r => r.id === id ? { ...r, status: newStatus } : r));
    // In Phase 7, this will be an API call
  };

  const implementedRecs = recs.filter(r => r.status === 'Implemented');
  const totalSavingsRs = implementedRecs.reduce((sum, r) => sum + r.savingsRs, 0);
  const totalCo2 = implementedRecs.reduce((sum, r) => sum + r.co2Reduction, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Savings Tracker</h2>
          <SavingsSummary totalSavingsRs={totalSavingsRs} />
        </div>
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Carbon Impact</h2>
          <CarbonImpact totalCo2={totalCo2} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Active Recommendations</h2>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {recs.map(rec => (
            <RecommendationCard key={rec.id} data={rec} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>
    </div>
  );
}