'use client';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function SummaryCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendUpIsGood = true,
  color = 'primary',
  subRows,
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

  const isPositiveStatus = trendUpIsGood ? !trend?.startsWith('-') : trend?.startsWith('-');
  const arrowStr = trend?.startsWith('-') ? '↓' : '↑';
  const cleanTrend = trend?.replace(/^[+-]/, '');

  const formattedValue = typeof displayValue === 'number'
    ? displayValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })
    : displayValue;

  return (
    <div className="card" style={{ position:'relative', minHeight:'120px',
                                   display:'flex', flexDirection:'column',
                                   justifyContent:'space-between' }}>

      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', marginBottom:'12px' }}>
        <span className="metric-label">{title}</span>
        <button className="expand-btn" title="Expand">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>

      {/* Main metric */}
      <div style={{ display:'flex', alignItems:'baseline', gap:'6px',
                    marginBottom:'8px' }}>
        <span className="metric-value-lg">{formattedValue}</span>
        {unit && (
          <span style={{ fontSize:'14px', color:'var(--text-secondary)',
                         fontWeight:400 }}>{unit}</span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div style={{ fontSize:'11px', fontWeight:500,
                      color: isPositiveStatus ? 'var(--accent)' : '#EF4444',
                      marginBottom:'8px' }}>
          {arrowStr} {cleanTrend}
        </div>
      )}

      {/* Sub rows */}
      {subRows && subRows.map((row, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center',
                               gap:'8px', marginTop:'4px' }}>
          <span className={
            row.color === 'orange' ? 'dot-orange' :
            row.color === 'white'  ? 'dot-white'  : 'dot-gray'
          }/>
          <span style={{ fontSize:'12px', color:'var(--text-secondary)',
                         flex:1 }}>{row.label}</span>
          <span style={{ fontSize:'12px', color:'var(--text-primary)',
                         fontWeight:500 }}>{row.value}</span>
        </div>
      ))}

    </div>
  );
}