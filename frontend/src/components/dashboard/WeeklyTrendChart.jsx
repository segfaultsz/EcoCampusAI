'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { day: 'Mon', actual: 2400, forecast: 2500 },
  { day: 'Tue', actual: 2600, forecast: 2550 },
  { day: 'Wed', actual: 2500, forecast: 2600 },
  { day: 'Thu', actual: 2700, forecast: 2650 },
  { day: 'Fri', actual: 2800, forecast: 2700 },
  { day: 'Sat', actual: 1200, forecast: 1300 },
  { day: 'Sun', actual: 1000, forecast: 1100 },
];

export default function WeeklyTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
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
        <Area
          type="monotone"
          dataKey="actual"
          stackId="1"
          stroke="#F26415"
          fill="#F26415"
          fillOpacity={0.6}
          name="Actual"
        />
        <Area
          type="monotone"
          dataKey="forecast"
          stackId="2"
          stroke="#3E3E3E"
          fill="#3E3E3E"
          fillOpacity={0.3}
          name="Forecast"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
