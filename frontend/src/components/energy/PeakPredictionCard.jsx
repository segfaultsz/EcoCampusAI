'use client';
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
}
