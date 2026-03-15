'use client';
import ForecastChart from '@/components/predictions/ForecastChart';
import PeakAlertCards from '@/components/predictions/PeakAlertCards';
import ModelAccuracyCard from '@/components/predictions/ModelAccuracyCard';
import WhatIfSimulator from '@/components/predictions/WhatIfSimulator';
import ExplanationPanel from '@/components/predictions/ExplanationPanel';

export default function PredictionsPage() {
  return (
    <div style={{ padding:'28px', minHeight:'100vh', background:'var(--bg-base)' }} className="space-y-6">
      <div className="card">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>7-Day Energy Forecast</h2>
        <ForecastChart />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Peak Alerts</h2>
          <PeakAlertCards />
        </div>
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Model Accuracy</h2>
          <ModelAccuracyCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>What-If Simulator</h2>
          <WhatIfSimulator />
        </div>
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Explanation</h2>
          <ExplanationPanel />
        </div>
      </div>
    </div>
  );
}