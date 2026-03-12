'use client';
import { useMemo } from 'react';

function generateHeatmapData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [];
  for (let d = 0; d < 7; d++) {
    const row = { day: days[d], hours: [] };
    for (let h = 0; h < 24; h++) {
      const base = h > 9 && h < 16 ? 80 : 30;
      const val = Math.min(100, Math.floor(base + Math.random() * 40));
      row.hours.push(val);
    }
    data.push(row);
  }
  return data;
}

function getColor(value) {
  if (value < 40) return 'bg-green-600';
  if (value < 70) return 'bg-yellow-600';
  return 'bg-red-600';
}

export default function HeatmapChart({ building, dateRange }) {
  const data = useMemo(generateHeatmapData, []);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header row for hours */}
        <div className="flex">
          <div className="w-16 flex-shrink-0"></div>
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="w-8 flex-shrink-0 text-center text-xs text-gray-400">
              {h}
            </div>
          ))}
        </div>
        {data.map((row) => (
          <div key={row.day} className="flex items-center">
            <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-300">{row.day}</div>
            {row.hours.map((val, h) => (
              <div key={h} className={`h-6 w-8 border border-gray-800 ${getColor(val)}`} title={`${row.day} ${h}:00 — ${val}%`}></div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end space-x-4 text-xs text-gray-400">
        <span>Low</span>
        <div className="flex space-x-1">
          <div className="h-4 w-4 bg-green-600"></div>
          <div className="h-4 w-4 bg-yellow-600"></div>
          <div className="h-4 w-4 bg-red-600"></div>
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
