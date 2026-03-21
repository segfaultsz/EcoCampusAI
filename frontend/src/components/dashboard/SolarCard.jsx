'use client'
import { usePolling, useCountUp } from '@/lib/hooks'

const SUN_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    {[0,45,90,135,180,225,270,315].map((deg, i) => {
      const rad = (deg * Math.PI) / 180
      const x1 = 12 + 8 * Math.cos(rad), y1 = 12 + 8 * Math.sin(rad)
      const x2 = 12 + 10 * Math.cos(rad), y2 = 12 + 10 * Math.sin(rad)
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>
    })}
  </svg>
)

function getLevel(wm2) {
  if (wm2 === null || wm2 === undefined) return { label: 'No data', color: 'var(--text-secondary)', bar: 0 }
  if (wm2 >= 700) return { label: 'Very high',  color: '#F26415', bar: 100 }
  if (wm2 >= 400) return { label: 'High',       color: '#F26415', bar: 70  }
  if (wm2 >= 150) return { label: 'Moderate',   color: '#D2D2D2', bar: 40  }
  return              { label: 'Low',         color: '#8A8A8A', bar: 15  }
}

function SkeletonCard() {
  return (
    <div className="card" style={{ height: '144px' }}>
      <div className="animate-shimmer" style={{ height: '16px', width: '128px', borderRadius: '4px', marginBottom: '12px' }}/>
      <div className="animate-shimmer" style={{ height: '32px', width: '96px', borderRadius: '4px', marginBottom: '8px' }}/>
      <div className="animate-shimmer" style={{ height: '12px', width: '160px', borderRadius: '4px' }}/>
    </div>
  )
}

export default function SolarCard() {
  const { data, loading, error, refetch } = usePolling('/api/solar', 300_000)
  const animated = useCountUp(data?.irradiance_wm2, 1000)

  if (loading) return <SkeletonCard />

  if (error) return (
    <div className="card" style={{ height: '144px', display: 'flex', flexDirection: 'col', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Solar Irradiance</span>
        <span style={{ color: 'var(--text-secondary)' }}>{SUN_ICON}</span>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Data unavailable</p>
      <button onClick={refetch}
        style={{ color: 'var(--accent)', fontSize:'12px', background:'transparent',
                 border:'none', cursor:'pointer', padding:0, textDecoration:'underline', textAlign: 'left' }}>
        Retry
      </button>
    </div>
  )

  const level = getLevel(data?.irradiance_wm2)
  const updated = data?.timestamp
    ? new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="card animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Solar irradiance</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-indicator"/>
          <span style={{ color: 'var(--accent)' }}>{SUN_ICON}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '4px' }}>
        <span className="metric-value">
          {Math.round(animated)}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '2px' }}>W/m²</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: level.color }}>{level.label}</span>
        <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{ height: '100%', background: 'var(--accent)', borderRadius: '9999px', transition: 'all 1s', width: `${level.bar}%` }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
        <span>☁ {data?.cloud_cover_pct ?? '—'}%</span>
        <span>🌡 {data?.temp_c ?? '—'}°C</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: '11px' }}>{updated}</span>
      </div>
    </div>
  )
}
