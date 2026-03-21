'use client';
import { Download, FileText } from 'lucide-react';

export default function ExportActions({ filters }) {
  const handlePrint = () => {
    window.print();
  };

  const handleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Metric,Value\nTotal Energy,145200\nTotal Waste,8450\nCarbon Footprint,119064";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EcoCampus_Report_${filters.dateRange.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        onClick={handleCSV}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px',
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '13px',
          cursor: 'pointer',
          fontFamily: 'Urbanist',
          transition: 'all 0.15s'
        }}
      >
        <Download size={16} />
        <span style={{ fontWeight: 500 }}>CSV</span>
      </button>
      <button
        onClick={handlePrint}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px',
          background: 'var(--accent)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'Urbanist',
          transition: 'opacity 0.15s'
        }}
      >
        <FileText size={16} />
        <span style={{ fontWeight: 500 }}>PDF Print</span>
      </button>
    </div>
  );
}