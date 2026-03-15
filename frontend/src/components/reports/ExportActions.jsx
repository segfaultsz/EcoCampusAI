'use client';
import { Download, FileText } from 'lucide-react';

export default function ExportActions({ filters }) {
  const handlePrint = () => {
    window.print();
  };

  const handleCSV = () => {
    // Mock CSV generation
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
    <div className="flex gap-3">
      <button 
        onClick={handleCSV}
        className="flex items-center gap-2 px-4 py-2 card hover:bg-slate-700 rounded-lg transition-colors "
      >
        <Download size={16} />
        <span className="text-sm font-medium">CSV</span>
      </button>
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        <FileText size={16} />
        <span className="text-sm font-medium">PDF Print</span>
      </button>
    </div>
  );
}