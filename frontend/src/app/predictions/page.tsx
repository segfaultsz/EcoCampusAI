'use client';
import ForecastChart from '@/components/predictions/ForecastChart';
import PeakAlertCards from '@/components/predictions/PeakAlertCards';
import ModelAccuracyCard from '@/components/predictions/ModelAccuracyCard';
import WhatIfSimulator from '@/components/predictions/WhatIfSimulator';
import ExplanationPanel from '@/components/predictions/ExplanationPanel';

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">7-Day Energy Forecast</h2>
        <ForecastChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Peak Alerts</h2>
          <PeakAlertCards />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Model Accuracy</h2>
          <ModelAccuracyCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">What-If Simulator</h2>
          <WhatIfSimulator />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Explanation</h2>
          <ExplanationPanel />
        </div>
      </div>
    </div>
  );
}
