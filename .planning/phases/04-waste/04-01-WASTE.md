---
wave: 1
depends_on: ["02"]
files_modified:
  - frontend/src/app/waste/page.tsx
  - frontend/src/components/waste/WasteStackedBar.jsx
  - frontend/src/components/waste/WasteTable.jsx
  - frontend/src/components/waste/DiversionGauge.jsx
  - frontend/src/components/waste/WasteTrendChart.jsx
  - frontend/src/components/waste/WastePieChart.jsx
autonomous: true
---

<plan>
<objective>Phase 4: Waste Management — Build waste page with all visualizations and table</objective>

<tasks>
  <task id="1">
    <title>Create Waste Page</title>
    <description>Create frontend/src/app/waste/page.tsx with page title "Waste Management". Include any needed filters (maybe building selector). Assemble components.</description>
    <file_edits>
      <edit path="frontend/src/app/waste/page.tsx">'use client';
import WasteStackedBar from '@/components/waste/WasteStackedBar';
import WasteTable from '@/components/waste/WasteTable';
import DiversionGauge from '@/components/waste/DiversionGauge';
import WasteTrendChart from '@/components/waste/WasteTrendChart';
import WastePieChart from '@/components/waste/WastePieChart';

export default function WastePage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Daily Waste Collection</h2>
        <WasteStackedBar />
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Building-wise Waste</h2>
        <WasteTable />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Waste Diversion Rate</h2>
          <DiversionGauge />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Monthly Waste Trend</h2>
          <WasteTrendChart />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Waste Composition</h2>
        <WastePieChart />
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="2">
    <title>Build WasteStackedBar</title>
    <description>Stacked bar chart: daily waste by type (organic, recyclable, e-waste, general). Use Recharts BarChart with stacked bars. 30 days of data.</description>
    <file_edits>
      <edit path="frontend/src/components/waste/WasteStackedBar.jsx">'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function generateData() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    organic: Math.floor(Math.random() * 50) + 30,
    recyclable: Math.floor(Math.random() * 40) + 20,
    e_waste: Math.floor(Math.random() * 10) + 5,
    general: Math.floor(Math.random() * 60) + 40,
  }));
}

export default function WasteStackedBar() {
  const data = generateData();
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#94a3b8" tickFormatter={(d) => `${d}d`} />
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
        <Bar dataKey="organic" stackId="1" fill="#10b981" name="Organic" />
        <Bar dataKey="recyclable" stackId="1" fill="#3b82f6" name="Recyclable" />
        <Bar dataKey="e_waste" stackId="1" fill="#f59e0b" name="E-Waste" />
        <Bar dataKey="general" stackId="1" fill="#64748b" name="General" />
      </BarChart>
    </ResponsiveContainer>
  );
}</edit>
    </file_edits>
  </task>

  <task id="3">
    <title>Build WasteTable</title>
    <description>Sortable table: columns Building, Organic, Recyclable, E-Waste, General, Total. Mock 10 buildings with totals computed.</description>
    <file_edits>
      <edit path="frontend/src/components/waste/WasteTable.jsx">'use client';
import { useState } from 'react';

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

function generateRow() {
  const organic = Math.floor(Math.random() * 100) + 50;
  const recyclable = Math.floor(Math.random() * 80) + 40;
  const e_waste = Math.floor(Math.random() * 20) + 5;
  const general = Math.floor(Math.random() * 120) + 60;
  return { organic, recyclable, e_waste, general, total: organic + recyclable + e_waste + general };
}

export default function WasteTable() {
  const [sortConfig, setSortConfig] = useState({ key: 'total', dir: 'desc' });
  const rows = buildings.map((b) => ({ ...b, ...generateRow() }));

  const sorted = [...rows].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.dir === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const headers = ['Building', 'Organic', 'Recyclable', 'E-Waste', 'General', 'Total'];
  const keys = ['name', 'organic', 'recyclable', 'e_waste', 'general', 'total'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-sm font-semibold text-gray-300">
                <button
                  className="focus:outline-none"
                  onClick={() =>
                    setSortConfig({
                      key: keys[headers.indexOf(h)],
                      dir: sortConfig.key === keys[headers.indexOf(h)] && sortConfig.dir === 'asc' ? 'desc' : 'asc',
                    })
                  }
                >
                  {h} {sortConfig.key === keys[headers.indexOf(h)] ? (sortConfig.dir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.code} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="px-4 py-2 text-sm">
                <span className="font-medium">{row.code}</span> — {row.name}
              </td>
              <td className="px-4 py-2 text-sm">{row.organic}</td>
              <td className="px-4 py-2 text-sm">{row.recyclable}</td>
              <td className="px-4 py-2 text-sm">{row.e_waste}</td>
              <td className="px-4 py-2 text-sm">{row.general}</td>
              <td className="px-4 py-2 text-sm font-semibold text-primary-400">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="4">
    <title>Build DiversionGauge</title>
    <description>Circular progress gauge showing % waste diverted from landfill. Green if >60%, yellow 40-60%, red <40%. Use SVG circle with stroke-dashoffset.</description>
    <file_edits>
      <edit path="frontend/src/components/waste/DiversionGauge.jsx">'use client';
import { useEffect, useState } from 'react';

function generateDiversion() {
  return Math.floor(Math.random() * 60) + 30; // 30-90%
}

export default function DiversionGauge() {
  const [value, setValue] = useState(0);
  const target = generateDiversion();

  useEffect(() => {
    let start = null;
    const duration = 1000;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 60 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#334155" strokeWidth="8" />
          {/* Foreground arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{value}%</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-400">
        {value >= 60 ? 'Above target' : value >= 40 ? 'Near target' : 'Needs improvement'}
      </p>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="5">
    <title>Build WasteTrendChart</title>
    <description>Monthly waste trend line chart (12 months) with target line overlay (dashed). Show total waste per month.</description>
    <file_edits>
      <edit path="frontend/src/components/waste/WasteTrendChart.jsx">'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function generateData() {
  return months.map((m, i) => ({
    month: m,
    total: Math.floor(Math.random() * 2000) + 3000 + (i >= 6 ? -500 : 0),
  }));
}

const target = 3500;

export default function WasteTrendChart() {
  const data = generateData();
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
}</edit>
    </file_edits>
  </task>

  <task id="6">
    <title>Build WastePieChart</title>
    <description>Waste composition donut chart showing average proportions of organic, recyclable, e-waste, general. Use fixed averages.</description>
    <file_edits>
      <edit path="frontend/src/components/waste/WastePieChart.jsx">'use client';
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
}</edit>
    </file_edits>
  </task>
</tasks>

<verification>
  <must_have id="vh-1">Waste page renders with all sections</must_have>
  <must_have id="vh-2">WasteStackedBar shows stacked bars by day and type</must_have>
  <must_have id="vh-3">WasteTable displays 10 buildings with sortable columns</must_have>
  <must_have id="vh-4">DiversionGauge animates to a percentage and uses appropriate color</must_have>
  <must_have id="vh-5">WasteTrendChart shows 12-month line plus target line</must_have>
  <must_have id="vh-6">WastePieChart displays composition donut</must_have>
  <must_have id="vh-7">All components use glass-card and dark theme</must_have>
</verification>
</plan>
