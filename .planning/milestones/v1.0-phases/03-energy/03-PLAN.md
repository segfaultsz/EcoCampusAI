---
wave: 1
depends_on: ["02"]
files_modified:
  - frontend/src/app/energy/page.tsx
  - frontend/src/components/energy/EnergyDetailChart.jsx
  - frontend/src/components/energy/HeatmapChart.jsx
  - frontend/src/components/energy/PeakPredictionCard.jsx
  - frontend/src/components/energy/ComparisonChart.jsx
  - frontend/src/components/energy/AnomalyTimeline.jsx
autonomous: true
---

<plan>
<objective>Phase 3: Energy Analytics — Build detailed energy analysis page with filters, heatmap, peak prediction, historical comparison, and anomaly timeline</objective>

<tasks>
  <task id="1">
    <title>Create Energy Page Structure</title>
    <description>Create frontend/src/components/energy/EnergyPage.jsx (or page.js under /energy route). Set up state for building selector and date range. Add page layout with glass-card sections.</description>
    <file_edits>
      <edit path="frontend/src/app/energy/page.tsx">'use client';
import { useState } from 'react';
import EnergyDetailChart from '@/components/energy/EnergyDetailChart';
import HeatmapChart from '@/components/energy/HeatmapChart';
import PeakPredictionCard from '@/components/energy/PeakPredictionCard';
import ComparisonChart from '@/components/energy/ComparisonChart';
import AnomalyTimeline from '@/components/energy/AnomalyTimeline';

const buildings = [
  { code: 'CSE', name: 'Computer Science Block' },
  { code: 'ECE', name: 'Electronics Block' },
  { code: 'LIB', name: 'Central Library' },
  { code: 'ADM', name: 'Admin Building' },
  { code: 'MEC', name: 'Mechanical Workshop' },
  { code: 'HOS1', name: 'Boys Hostel A' },
  { code: 'HOS2', name: 'Girls Hostel B' },
  { code: 'CAF', name: 'Cafeteria Complex' },
  { code: 'SPT', name: 'Sports Complex' },
  { code: 'SCI', name: 'Science Block' },
];

export default function EnergyPage() {
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '2026-03-05', end: '2026-03-12' });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">Building:</label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="rounded border border-gray-700 bg-dark-800 px-3 py-2 text-gray-200 focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="rounded border border-gray-700 bg-dark-800 px-3 py-2 text-gray-200"
          />
          <label className="text-sm text-gray-400">To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="rounded border border-gray-700 bg-dark-800 px-3 py-2 text-gray-200"
          />
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Hourly Consumption</h2>
        <EnergyDetailChart building={selectedBuilding} dateRange={dateRange} />
      </div>

      {/* Heatmap */}
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Usage Heatmap (Day × Hour)</h2>
        <HeatmapChart building={selectedBuilding} dateRange={dateRange} />
      </div>

      {/* Peak Prediction and Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Peak Prediction</h2>
          <PeakPredictionCard building={selectedBuilding} />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Historical Comparison</h2>
          <ComparisonChart building={selectedBuilding} />
        </div>
      </div>

      {/* Anomaly Timeline */}
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Detected Anomalies</h2>
        <AnomalyTimeline building={selectedBuilding} />
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="2">
    <title>Build EnergyDetailChart</title>
    <description>Create frontend/src/components/energy/EnergyDetailChart.jsx showing hourly consumption with actual (solid) and predicted (dashed) lines, plus peak markers (red dots) on highest consumption points. Use mock data with 24-hour range.</description>
    <file_edits>
      <edit path="frontend/src/components/energy/EnergyDetailChart.jsx">'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

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
}</edit>
    </file_edits>
  </task>

  <task id="3">
    <title>Build HeatmapChart</title>
    <description>Create frontend/src/components/energy/HeatmapChart.jsx as a 7×24 grid of colored cells. Color intensity based on consumption (green→yellow→red). Use CSS grid: 24 columns, 7 rows. Provide day labels on left, hour labels on bottom.</description>
    <file_edits>
      <edit path="frontend/src/components/energy/HeatmapChart.jsx">'use client';
import { useMemo } from 'react';

function generateHeatmapData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [];
  for (let d = 0; d < 7; d++) {
    const row = { day: days[d], hours: [] };
    for (let h = 0; h < 24; h++) {
      // Base consumption higher during work hours, random variation
      const base = h > 9 && h < 16 ? 80 : 30;
      const val = Math.min(100, Math.floor(base + Math.random() * 40));
      row.hours.push(val);
    }
    data.push(row);
  }
  return data;
}

function getColor(value) {
  if (value < 40) return 'bg-green-600';
  if (value < 70) return 'bg-yellow-600';
  return 'bg-red-600';
}

export default function HeatmapChart({ building, dateRange }) {
  const data = useMemo(() => generateHeatmapData(), []);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header row for hours */}
        <div className="flex">
          <div className="w-16 flex-shrink-0"></div>
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="w-8 flex-shrink-0 text-center text-xs text-gray-400">
              {h}
            </div>
          ))}
        </div>
        {data.map((row) => (
          <div key={row.day} className="flex items-center">
            <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-300">{row.day}</div>
            {row.hours.map((val, h) => (
              <div key={h} className={`h-6 w-8 border border-gray-800 ${getColor(val)}`} title={`${row.day} ${h}:00 — ${val}%`}></div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end space-x-4 text-xs text-gray-400">
        <span>Low</span>
        <div className="flex space-x-1">
          <div className="h-4 w-4 bg-green-600"></div>
          <div className="h-4 w-4 bg-yellow-600"></div>
          <div className="h-4 w-4 bg-red-600"></div>
        </div>
        <span>High</span>
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="4">
    <title>Build PeakPredictionCard</title>
    <description>Create frontend/src/components/energy/PeakPredictionCard.jsx showing next predicted peak event. Include countdown timer updating every second. Display severity badge (High/Medium/Low).</description>
    <file_edits>
      <edit path="frontend/src/components/energy/PeakPredictionCard.jsx">'use client';
import { useState, useEffect } from 'react';

const mockPeak = {
  date: '2026-03-13',
  time: '14:00',
  building: 'Science Block',
  kwh: 456,
  severity: 'high',
};

export default function PeakPredictionCard({ building }) {
  const [countdown, setCountdown] = useState({ hours: 3, minutes: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59 };
        return { hours: 0, minutes: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const severityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-green-500/20 text-green-400 border-green-500/50',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Next predicted peak:</span>
        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${severityColors[mockPeak.severity]}`}>
          {mockPeak.severity.toUpperCase()}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">
        Tomorrow {mockPeak.time} — ~{mockPeak.kwh} kWh
      </div>
      <div className="text-sm text-gray-400">
        Building: {building === 'All' ? mockPeak.building : building || mockPeak.building}
      </div>
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-400">Countdown:</span>
        <span className="font-mono text-primary-400">
          {countdown.hours}h {countdown.minutes}m
        </span>
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="5">
    <title>Build ComparisonChart</title>
    <description>Create frontend/src/components/energy/ComparisonChart.jsx showing this week vs last week energy consumption overlay. Use line chart with two lines (solid vs dashed).</description>
    <file_edits>
      <edit path="frontend/src/components/energy/ComparisonChart.jsx">'use client';
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
}</edit>
    </file_edits>
  </task>

  <task id="6">
    <title>Build AnomalyTimeline</title>
    <description>Create frontend/src/components/energy/AnomalyTimeline.jsx displaying vertical list of anomalies with timestamp, description, severity badge. Mock 5 anomalies with different severities.</description>
    <file_edits>
      <edit path="frontend/src/components/energy/AnomalyTimeline.jsx">'use client';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockAnomalies = [
  { id: 1, timestamp: '2026-03-11 14:23', building: 'CSE', description: 'Overconsumption detected', severity: 'high' },
  { id: 2, timestamp: '2026-03-11 02:15', building: 'LIB', description: 'Unusual night usage', severity: 'medium' },
  { id: 3, timestamp: '2026-03-10 20:45', building: 'HOS1', description: 'AC runtime exceeded threshold', severity: 'high' },
  { id: 4, timestamp: '2026-03-10 10:30', building: 'MEC', description: 'Power factor dropped', severity: 'low' },
  { id: 5, timestamp: '2026-03-09 16:00', building: 'SCI', description: 'Voltage fluctuation', severity: 'medium' },
];

export default function AnomalyTimeline({ building }) {
  const filtered = building === 'All' ? mockAnomalies : mockAnomalies.filter(a => a.building === building);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-700"></div>

      <div className="space-y-6">
        {filtered.map((anomaly, idx) => (
          <div key={anomaly.id} className="relative pl-12">
            {/* Dot */}
            <div
              className={`absolute left-2 h-4 w-4 rounded-full border-2 border-dark-900 ${
                anomaly.severity === 'high' ? 'bg-red-500' :
                anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            ></div>

            <div className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{anomaly.timestamp} — {anomaly.building}</p>
                  <p className="font-medium">{anomaly.description}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-semibold',
                    anomaly.severity === 'high' && 'bg-red-500/20 text-red-400',
                    anomaly.severity === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                    anomaly.severity === 'low' && 'bg-green-500/20 text-green-400'
                  )}
                >
                  {anomaly.severity}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-400 italic">No anomalies detected for selected building.</p>
        )}
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>
</tasks>

<verification>
  <must_have id="vh-1">Energy page route (/energy) renders with filters and all sections</must_have>
  <must_have id="vh-2">Building selector filters data (at least locally, mock data respects building filter in AnomalyTimeline)</must_have>
  <must_have id="vh-3">EnergyDetailChart shows 24h line with peak marker (red dot) on highest point</must_have>
  <must_have id="vh-4">Heatmap displays 7x24 grid with color-coded intensity</must_have>
  <must_have id="vh-5">PeakPredictionCard shows countdown timer and severity badge</must_have>
  <must_have id="vh-6">ComparisonChart overlays this week vs last week</must_have>
  <must_have id="vh-7">AnomalyTimeline displays list with severity badges and building filter support</must_have>
  <must_have id="vh-8">All components use dark theme colors and glass-card styling</must_have>
</verification>
</plan>
