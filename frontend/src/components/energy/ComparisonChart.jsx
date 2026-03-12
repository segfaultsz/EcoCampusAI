'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function generateWeekData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    thisWeek: Math.floor(Math.random() * 1000) + 2000 + (i >= 5 ? -800 : 0),
    lastWeek: Math.floor(Math.random() * 1000) + 1900 + (i >= 5 ? -700 : 0),
  }));
}

export default function ComparisonChart({ building }) {
  const data = generateWeekData();

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#94a3b8" />
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
        <Line
          type="monotone"
          dataKey="thisWeek"
          stroke="#10b981"
          strokeWidth={2}
          name="This Week"
        />
        <Line
          type="monotone"
          dataKey="lastWeek"
          stroke="#64748b"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Last Week"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
