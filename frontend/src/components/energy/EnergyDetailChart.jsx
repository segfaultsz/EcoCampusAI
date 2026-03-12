'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function generateMockData() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    consumption: Math.floor(Math.random() * 200) + 100 + (i > 9 && i < 16 ? 100 : 0),
    predicted: Math.floor(Math.random() * 180) + 120 + (i > 9 && i < 16 ? 80 : 0),
  }));
}

function PeakDot(props) {
  const { cx, cy, payload } = props;
  if (payload.isPeak) {
    return (
      <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="white" strokeWidth={2} />
    );
  }
  return null;
}

export default function EnergyDetailChart({ building, dateRange }) {
  const data = generateMockData();
  const peakIdx = data.reduce((maxIdx, point, idx) => (point.consumption > data[maxIdx].consumption ? idx : maxIdx), 0);
  const dataWithPeak = data.map((pt, idx) => ({ ...pt, isPeak: idx === peakIdx }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dataWithPeak}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="hour" stroke="#94a3b8" tickFormatter={(h) => `${h}:00`} />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Line
          type="monotone"
          dataKey="consumption"
          stroke="#10b981"
          strokeWidth={2}
          dot={<PeakDot />}
          name="Actual"
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Predicted"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
