'use client';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function generateData() {
  const hours = 7 * 24;
  return Array.from({ length: hours }, (_, i) => {
    const day = Math.floor(i / 24) + 1;
    const hour = i % 24;
    const actual = Math.floor(Math.random() * 200) + 100 + (hour > 9 && hour < 16 ? 100 : 0);
    const predicted = actual + (Math.random() * 40 - 20);
    const lower = predicted * 0.9;
    const upper = predicted * 1.1;
    return { time: `D${day} ${hour}:00`, actual, predicted, lower, upper };
  });
}

export default function ForecastChart() {
  const data = generateData();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="time" stroke="#94a3b8" interval={23} />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }} />
        <Area type="monotone" dataKey="lower" stroke="none" fill="#3b82f6" fillOpacity={0.2} />
        <Area type="monotone" dataKey="upper" stroke="none" fill="#3b82f6" fillOpacity={0.2} />
        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
        <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
