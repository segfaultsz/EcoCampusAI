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

  const inputStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    padding: '8px 12px',
    outline: 'none',
    fontFamily: 'Urbanist',
    transition: 'border-color 0.15s'
  };

  const handleFocus = (e) => e.target.style.borderColor = 'var(--charcoal)';
  const handleBlur = (e) => e.target.style.borderColor = 'var(--border)';

  return (
    <div style={{ padding:'28px', minHeight:'100vh', background:'var(--bg-base)' }} className="space-y-6">
      <h1 style={{ fontSize:'28px', fontWeight:600, letterSpacing:'-0.02em', color:'var(--text-primary)', marginBottom:'16px' }}>
        Energy Analytics
      </h1>

      {/* Filters */}
      <div className="card flex flex-wrap gap-6 items-center">
        <div className="flex items-center space-x-2">
          <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Building:</label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
          <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Main Chart */}
      <div className="card">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Hourly Consumption</h2>
        <EnergyDetailChart building={selectedBuilding} dateRange={dateRange} />
      </div>

      {/* Heatmap */}
      <div className="card">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Usage Heatmap (Day × Hour)</h2>
        <HeatmapChart building={selectedBuilding} dateRange={dateRange} />
      </div>

      {/* Peak Prediction and Comparison */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Peak Prediction</h2>
          <PeakPredictionCard building={selectedBuilding} />
        </div>
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Historical Comparison</h2>
          <ComparisonChart building={selectedBuilding} />
        </div>
      </div>

      {/* Anomaly Timeline */}
      <div className="card">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Detected Anomalies</h2>
        <AnomalyTimeline building={selectedBuilding} />
      </div>
    </div>
  );
}