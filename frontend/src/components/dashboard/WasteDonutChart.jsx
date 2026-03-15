'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Organic', value: 120 },
  { name: 'Recyclable', value: 80 },
  { name: 'E-Waste', value: 30 },
  { name: 'General', value: 110 },
];

const COLORS = ['#F26415', '#3E3E3E', '#1F1F1F', '#D2D2D2'];

export default function WasteDonutChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="#0A0A0A"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
          itemStyle={{ color: '#FFFFFF' }}
        />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#8A8A8A', fontFamily: 'Urbanist', paddingTop: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
