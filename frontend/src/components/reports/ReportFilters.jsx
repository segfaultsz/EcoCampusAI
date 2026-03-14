'use client';
export default function ReportFilters({ filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row gap-8">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
        <select 
          value={filters.dateRange} 
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Semester</option>
          <option>Year to Date</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-400 mb-2">Building</label>
        <select 
          value={filters.building} 
          onChange={(e) => setFilters({ ...filters, building: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
        >
          <option>All Buildings</option>
          <option>Science Block</option>
          <option>Computer Science</option>
          <option>Library</option>
        </select>
      </div>
    </div>
  );
}