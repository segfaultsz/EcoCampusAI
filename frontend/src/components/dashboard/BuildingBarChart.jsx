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
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="0" horizontal />
        <XAxis type="number" tick={{ fill: '#4A4A4A', fontSize: 11, fontFamily: 'Urbanist' }} axisLine={{ stroke: '#1F1F1F' }} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fill: '#4A4A4A', fontSize: 11, fontFamily: 'Urbanist' }} axisLine={{ stroke: '#1F1F1F' }} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{
            background: '#111111',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '12px',
            fontFamily: 'Urbanist',
            padding: '10px 14px',
            boxShadow: 'none'
          }}
          labelStyle={{ color: '#8A8A8A', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          cursor={{ fill: '#1F1F1F' }}
        />
        <Bar dataKey="energy" fill="#F26415" fillOpacity={0.85} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
