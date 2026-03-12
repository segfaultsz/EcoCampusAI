'use client';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function SummaryCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendUpIsGood = true,
  color = 'primary',
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = useRef(value);

  useEffect(() => {
    targetValue.current = value;
    setDisplayValue(0);
    let start = null;
    const duration = 1000;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(progress * targetValue.current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  }, [value]);

  const trendColor =
    trendUpIsGood ^ (trend?.startsWith('+'))
      ? 'text-green-400'
      : 'text-red-400';
  const trendArrow = trend?.startsWith('+') ? '↑' : '↓';

  const colorClasses = {
    primary: 'bg-primary-500/20 text-primary-400',
    accent: 'bg-accent-500/20 text-accent-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`rounded-full p-3 ${colorClasses[color] || colorClasses.primary}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold">
              {typeof displayValue === 'number'
                ? displayValue.toLocaleString('en-IN', {
                    maximumFractionDigits: 1,
                  })
                : displayValue}{' '}
              {unit}
            </p>
          </div>
        </div>
        {trend && (
          <span className={cn('text-sm font-medium', trendColor)}>
            {trendArrow} {trend.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}
