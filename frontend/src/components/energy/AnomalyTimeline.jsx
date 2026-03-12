'use client';
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
  const filtered = building === 'All' ? mockAnomalies : mockAnomalies.filter(a => a.building === building || building === 'All');

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
}
