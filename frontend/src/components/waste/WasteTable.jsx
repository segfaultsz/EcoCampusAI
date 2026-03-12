'use client';
import { useState } from 'react';

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

function generateRow() {
  const organic = Math.floor(Math.random() * 100) + 50;
  const recyclable = Math.floor(Math.random() * 80) + 40;
  const e_waste = Math.floor(Math.random() * 20) + 5;
  const general = Math.floor(Math.random() * 120) + 60;
  return { organic, recyclable, e_waste, general, total: organic + recyclable + e_waste + general };
}

export default function WasteTable() {
  const [sortConfig, setSortConfig] = useState({ key: 'total', dir: 'desc' });
  const rows = buildings.map((b) => ({ ...b, ...generateRow() }));

  const sorted = [...rows].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.dir === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const headers = ['Building', 'Organic', 'Recyclable', 'E-Waste', 'General', 'Total'];
  const keys = ['name', 'organic', 'recyclable', 'e_waste', 'general', 'total'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-sm font-semibold text-gray-300">
                <button
                  className="focus:outline-none"
                  onClick={() =>
                    setSortConfig({
                      key: keys[headers.indexOf(h)],
                      dir: sortConfig.key === keys[headers.indexOf(h)] && sortConfig.dir === 'asc' ? 'desc' : 'asc',
                    })
                  }
                >
                  {h} {sortConfig.key === keys[headers.indexOf(h)] ? (sortConfig.dir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.code} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="px-4 py-2 text-sm">
                <span className="font-medium">{row.code}</span> — {row.name}
              </td>
              <td className="px-4 py-2 text-sm">{row.organic}</td>
              <td className="px-4 py-2 text-sm">{row.recyclable}</td>
              <td className="px-4 py-2 text-sm">{row.e_waste}</td>
              <td className="px-4 py-2 text-sm">{row.general}</td>
              <td className="px-4 py-2 text-sm font-semibold text-primary-400">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
