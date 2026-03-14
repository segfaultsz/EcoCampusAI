'use client';
import { useState } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportActions from '@/components/reports/ExportActions';
import ReportPreview from '@/components/reports/ReportPreview';

export default function ReportsPage() {
  const [filters, setFilters] = useState({ dateRange: 'Last 30 Days', building: 'All Buildings' });

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Generate Reports</h2>
          <p className="text-sm text-gray-400">Select parameters to view and export your campus sustainability report.</p>
        </div>
        <ExportActions filters={filters} />
      </div>

      <div className="dashboard-card p-8">
        <ReportFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* The printable area */}
      <div id="report-print-area" className="dashboard-card p-8 bg-slate-900">
        <ReportPreview filters={filters} />
      </div>
    </div>
  );
}