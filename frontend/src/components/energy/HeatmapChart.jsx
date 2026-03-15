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
  // Interpolation: low = '#1A1A1A', mid = '#7A3008', high = '#F26415'
  if (value < 40) return '#1A1A1A';
  if (value < 70) return '#7A3008';
  return '#F26415';
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
            <div key={h} className="w-8 flex-shrink-0 text-center text-xs text-[#4A4A4A] font-['Urbanist']">
              {h}
            </div>
          ))}
        </div>
        {data.map((row) => (
          <div key={row.day} className="flex items-center">
            <div className="w-16 flex-shrink-0 text-xs font-medium text-[#8A8A8A] font-['Urbanist']">{row.day}</div>
            {row.hours.map((val, h) => (
              <div key={h} style={{ backgroundColor: getColor(val), border: '1px solid #0A0A0A', borderRadius: '3px' }} className="h-6 w-8" title={`${row.day} ${h}:00 — ${val}%`}></div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end space-x-4 text-xs text-[#8A8A8A] font-['Urbanist']">
        <span>Low</span>
        <div className="flex space-x-1">
          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: '#1A1A1A', border: '1px solid #0A0A0A' }}></div>
          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: '#7A3008', border: '1px solid #0A0A0A' }}></div>
          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: '#F26415', border: '1px solid #0A0A0A' }}></div>
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
