'use client';
import { useState } from 'react';
import WasteStackedBar from '@/components/waste/WasteStackedBar';
import WasteTable from '@/components/waste/WasteTable';
import DiversionGauge from '@/components/waste/DiversionGauge';
import WasteTrendChart from '@/components/waste/WasteTrendChart';
import WastePieChart from '@/components/waste/WastePieChart';

export default function WastePage() {
  const [building, setBuilding] = useState('All Buildings');

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
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize:'28px', fontWeight:600, letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
          Waste Management
        </h1>
        <select
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value="All Buildings">All Buildings</option>
          <option value="Main Building">Main Building</option>
          <option value="Science Block">Science Block</option>
          <option value="Library">Library</option>
          <option value="Sports Complex">Sports Complex</option>
          <option value="Hostel A">Hostel A</option>
        </select>
      </div>

      <div className="card">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Daily Waste Collection</h2>
        <WasteStackedBar building={building} />
      </div>

      <div className="card">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Building-wise Waste</h2>
        <WasteTable building={building} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Waste Diversion Rate</h2>
          <DiversionGauge building={building} />
        </div>
        <div className="card">
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Monthly Waste Trend</h2>
          <WasteTrendChart building={building} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Waste Composition</h2>
        <WastePieChart building={building} />
      </div>
    </div>
  );
}