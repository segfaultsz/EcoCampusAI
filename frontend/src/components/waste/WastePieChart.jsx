'use client';
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#F26415', '#3E3E3E', '#f59e0b', '#64748b'];

function generateData(building) {
  const seed = building ? building.length : 1;
  const raw = [
    { name: 'Organic', val: Math.floor(Math.random() * 20 * seed) % 20 + 25 },
    { name: 'Recyclable', val: Math.floor(Math.random() * 15 * seed) % 15 + 15 },
    { name: 'E-Waste', val: Math.floor(Math.random() * 10 * seed) % 10 + 5 },
    { name: 'General', val: Math.floor(Math.random() * 20 * seed) % 20 + 20 },
  ];
  const total = raw.reduce((acc, curr) => acc + curr.val, 0);
  return raw.map((d, i) => ({ 
    name: d.name, 
    value: Math.round((d.val / total) * 100), 
    color: COLORS[i] 
  }));
}

export default function WastePieChart({ building = 'All Buildings' }) {
  const [hiddenSlices, setHiddenSlices] = useState({});
  const fullData = useMemo(() => generateData(building), [building]);
  
  const handleLegendClick = (e) => {
    const name = e.value;
    setHiddenSlices(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const chartData = fullData.map(item => ({
    ...item,
    value: hiddenSlices[item.name] ? 0 : item.value
  }));

  const legendPayload = fullData.map((item) => ({
    value: item.name,
    type: 'square',
    id: item.name,
    color: hiddenSlices[item.name] ? '#475569' : item.color, // Gray out if hidden
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
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
        <Legend 
          onClick={handleLegendClick} 
          payload={legendPayload} 
          wrapperStyle={{ cursor: 'pointer' }} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
}