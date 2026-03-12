---
wave: 1
depends_on: ["02"]
files_modified:
  - frontend/src/app/predictions/page.tsx
  - frontend/src/components/predictions/ForecastChart.jsx
  - frontend/src/components/predictions/PeakAlertCards.jsx
  - frontend/src/components/predictions/ModelAccuracyCard.jsx
  - frontend/src/components/predictions/WhatIfSimulator.jsx
  - frontend/src/components/predictions/ExplanationPanel.jsx
autonomous: true
---

<plan>
<objective>Phase 5: Predictions — Build AI predictions page with forecast, peak alerts, model stats, what-if simulator</objective>

<tasks>
  <task id="1">
    <title>Create Predictions Page</title>
    <description>Create frontend/src/app/predictions/page.tsx assembling all components.</description>
    <file_edits>
      <edit path="frontend/src/app/predictions/page.tsx">'use client';
import ForecastChart from '@/components/predictions/ForecastChart';
import PeakAlertCards from '@/components/predictions/PeakAlertCards';
import ModelAccuracyCard from '@/components/predictions/ModelAccuracyCard';
import WhatIfSimulator from '@/components/predictions/WhatIfSimulator';
import ExplanationPanel from '@/components/predictions/ExplanationPanel';

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">7-Day Energy Forecast</h2>
        <ForecastChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Peak Alerts</h2>
          <PeakAlertCards />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Model Accuracy</h2>
          <ModelAccuracyCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">What-If Simulator</h2>
          <WhatIfSimulator />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Explanation</h2>
          <ExplanationPanel />
        </div>
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="2">
    <title>Build ForecastChart</title>
    <description>Area chart with actual (area) + predicted dashed line + confidence band (shaded). 7 days hourly data.</description>
    <file_edits>
      <edit path="frontend/src/components/predictions/ForecastChart.jsx">'use client';
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
}</edit>
    </file_edits>
  </task>

  <task id="3">
    <title>Build PeakAlertCards</title>
    <description>Grid of cards: date, time, building, predicted kWh, severity badge. Mock 3 upcoming peaks.</description>
    <file_edits>
      <edit path="frontend/src/components/predictions/PeakAlertCards.jsx">'use client';
const alerts = [
  { id: 1, date: '2026-03-13', time: '14:00', building: 'Science Block', kwh: 456, severity: 'high' },
  { id: 2, date: '2026-03-14', time: '15:00', building: 'Computer Science', kwh: 389, severity: 'medium' },
  { id: 3, date: '2026-03-15', time: '13:00', building: 'Library', kwh: 312, severity: 'low' },
];

const severityColors = { high: 'bg-red-500/20 text-red-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-green-500/20 text-green-400' };

export default function PeakAlertCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alerts.map((a) => (
        <div key={a.id} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityColors[a.severity]}`}>{a.severity.toUpperCase()}</span>
            <span className="text-sm text-gray-400">{a.date}</span>
          </div>
          <div className="mt-2 text-lg font-bold">{a.time} — {a.kwh} kWh</div>
          <div className="text-sm text-gray-400">{a.building}</div>
        </div>
      ))}
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="4">
    <title>Build ModelAccuracyCard</title>
    <description>Display MAPE (8.5%), R² (0.92), last trained date. Simple card.</description>
    <file_edits>
      <edit path="frontend/src/components/predictions/ModelAccuracyCard.jsx">'use client';
export default function ModelAccuracyCard() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-400">MAPE</span>
        <span className="font-semibold text-primary-400">8.5%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">R²</span>
        <span className="font-semibold text-primary-400">0.92</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Last Trained</span>
        <span className="font-semibold">2025-03-12 10:30 AM</span>
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="5">
    <title>Build WhatIfSimulator</title>
    <description>Two sliders (AC shutdown hour, lighting reduction %), Simulate button, results area showing estimated savings. Mock result on button click.</description>
    <file_edits>
      <edit path="frontend/src/components/predictions/WhatIfSimulator.jsx">'use client';
import { useState } from 'react';

export default function WhatIfSimulator() {
  const [acHour, setAcHour] = useState(18);
  const [reduction, setReduction] = useState(10);
  const [result, setResult] = useState(null);

  const simulate = () => {
    const savingsKwh = Math.floor(acHour * 50 + reduction * 100);
    const savingsRs = savingsKwh * 10;
    setResult({ savingsKwh, savingsRs });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400">Shut AC at: {acHour}:00</label>
        <input type="range" min="16" max="22" value={acHour} onChange={(e) => setAcHour(Number(e.target.value))} className="w-full accent-primary-500" />
      </div>
      <div>
        <label className="block text-sm text-gray-400">Reduce lighting by: {reduction}%</label>
        <input type="range" min="0" max="50" value={reduction} onChange={(e) => setReduction(Number(e.target.value))} className="w-full accent-primary-500" />
      </div>
      <button onClick={simulate} className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Simulate</button>
      {result && (
        <div className="glass-card p-4 space-y-2">
          <div className="text-lg font-semibold text-primary-400">Estimated Savings</div>
          <div>{result.savingsKwh} kWh/month</div>
          <div>{result.savingsRs.toLocaleString('en-IN')} ₹/month</div>
        </div>
      )}
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="6">
    <title>Build ExplanationPanel</title>
    <description>Plain text explanation of AI predictions. Mock paragraph.</description>
    <file_edits>
      <edit path="frontend/src/components/predictions/ExplanationPanel.jsx">'use client';
export default function ExplanationPanel() {
  return (
    <div className="glass-card p-4 text-sm text-gray-300">
      <p>The forecast predicts a peak on Thursday due to scheduled exam periods increasing occupancy across academic buildings. Historical patterns show a 15% uplift during exams, and current trends align with this expectation. Confidence is higher for weekday peaks compared to weekends.</p>
    </div>
  );
}</edit>
    </file_edits>
  </task>
</tasks>

<verification>
  <must_have id="vh-1">Predictions page renders with all components</must_have>
  <must_have id="vh-2">ForecastChart shows area + dashed line + confidence band</must_have>
  <must_have id="vh-3">PeakAlertCards grid displays 3 cards with severity</must_have>
  <must_have id="vh-4">ModelAccuracyCard shows MAPE, R², date</must_have>
  <must_have id="vh-5">WhatIfSimulator sliders work and button shows results</must_have>
  <must_have id="vh-6">ExplanationPanel displays text</must_have>
</verification>
</plan>