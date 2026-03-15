'use client';
import { useEffect, useState, useMemo } from 'react';

function generateDiversion(building) {
  const seed = building ? building.length : 1;
  return Math.floor(Math.random() * 60 * seed) % 60 + 30; // 30-90%
}

export default function DiversionGauge({ building = 'All Buildings' }) {
  const [value, setValue] = useState(0);
  const target = useMemo(() => generateDiversion(building), [building]);

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
}