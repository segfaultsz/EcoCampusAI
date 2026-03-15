'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function generateData(building) {
  // Use building string length or char codes to pseudo-randomly seed data so it's consistent per building
  const seed = building ? building.length : 1;
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    organic: Math.floor(Math.random() * 50 * seed) % 50 + 30,
    recyclable: Math.floor(Math.random() * 40 * seed) % 40 + 20,
    e_waste: Math.floor(Math.random() * 10 * seed) % 10 + 5,
    general: Math.floor(Math.random() * 60 * seed) % 60 + 40,
  }));
}

export default function WasteStackedBar({ building = 'All Buildings' }) {
  const data = useMemo(() => generateData(building), [building]);
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#94a3b8" tickFormatter={(d) => `${d}d`} />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
        <Bar dataKey="organic" stackId="1" fill="#F26415" name="Organic" />
        <Bar dataKey="recyclable" stackId="1" fill="#3E3E3E" name="Recyclable" />
        <Bar dataKey="e_waste" stackId="1" fill="#f59e0b" name="E-Waste" />
        <Bar dataKey="general" stackId="1" fill="#64748b" name="General" />
      </BarChart>
    </ResponsiveContainer>
  );
}