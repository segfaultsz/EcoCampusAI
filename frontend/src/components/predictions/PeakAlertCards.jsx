'use client';
const alerts = [
  { id: 1, date: '2026-03-13', time: '14:00', building: 'Science Block', kwh: 456, severity: 'high' },
  { id: 2, date: '2026-03-14', time: '15:00', building: 'Computer Science', kwh: 389, severity: 'medium' },
  { id: 3, date: '2026-03-15', time: '13:00', building: 'Library', kwh: 312, severity: 'low' },
];

const severityColors = { high: 'bg-red-500/20 text-red-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-green-500/20 text-green-400' };

export default function PeakAlertCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {alerts.map((a) => (
        <div key={a.id} className="dashboard-card p-4">
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
}
