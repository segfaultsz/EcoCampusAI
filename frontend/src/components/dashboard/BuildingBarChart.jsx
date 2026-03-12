'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const buildings = [
  { name: 'CSE', energy: 320 },
  { name: 'ECE', energy: 280 },
  { name: 'LIB', energy: 360 },
  { name: 'ADM', energy: 170 },
  { name: 'MEC', energy: 450 },
  { name: 'HOS1', energy: 240 },
  { name: 'HOS2', energy: 220 },
  { name: 'CAF', energy: 200 },
  { name: 'SPT', energy: 100 },
  { name: 'SCI', energy: 300 },
];

export default function BuildingBarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={buildings} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal />
        <XAxis type="number" stroke="#94a3b8" />
        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={40} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Bar dataKey="energy" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
