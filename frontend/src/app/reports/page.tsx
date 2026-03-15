'use client';
import { useState } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportActions from '@/components/reports/ExportActions';
import ReportPreview from '@/components/reports/ReportPreview';

export default function ReportsPage() {
  const [filters, setFilters] = useState({ dateRange: 'Last 30 Days', building: 'All Buildings' });

  return (
    <div style={{ padding:'28px', minHeight:'100vh', background:'var(--bg-base)' }} className="space-y-6">
      <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Generate Reports</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Select parameters to view and export your campus sustainability report.</p>
        </div>
        <ExportActions filters={filters} />
      </div>

      <div className="card">
        <ReportFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* The printable area */}
      <div id="report-print-area" className="card" style={{ background: 'var(--bg-card)' }}>
        <ReportPreview filters={filters} />
      </div>
    </div>
  );
}