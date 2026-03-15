'use client';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function generateData(building) {
  const seed = building ? building.length : 1;
  return months.map((m, i) => ({
    month: m,
    total: Math.floor(Math.random() * 2000 * seed) % 2000 + 3000 + (i >= 6 ? -500 : 0),
  }));
}

const target = 3500;

export default function WasteTrendChart({ building = 'All Buildings' }) {
  const data = useMemo(() => generateData(building), [building]);
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#94a3b8" />
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
        <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total Waste (kg)" />
        <Line type="monotone" dataKey={() => target} stroke="#f59e0b" strokeDasharray="5 5" name="Target" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}