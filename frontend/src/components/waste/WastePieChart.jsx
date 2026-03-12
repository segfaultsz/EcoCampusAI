'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Organic', value: 35 },
  { name: 'Recyclable', value: 25 },
  { name: 'E-Waste', value: 10 },
  { name: 'General', value: 30 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#64748b'];

export default function WastePieChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value) => [`${value}%`, '']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
