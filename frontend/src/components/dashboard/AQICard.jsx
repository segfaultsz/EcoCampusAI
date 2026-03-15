'use client'
import { usePolling, useCountUp } from '@/lib/hooks'

function getAQILevel(aqi) {
  if (!aqi) return { label: 'No data',   color: 'var(--text-secondary)', bg: 'var(--bg-card)', pct: 0 }
  if (aqi <= 50)  return { label: 'Good',       color: '#10B981', bg: '#10B98120', pct: 15  }
  if (aqi <= 100) return { label: 'Moderate',   color: '#EAB308',  bg: '#EAB30820',  pct: 35  }
  if (aqi <= 150) return { label: 'Unhealthy (sensitive)', color: '#F26415', bg: '#F2641520', pct: 55  }
  if (aqi <= 200) return { label: 'Unhealthy',  color: '#F26415',    bg: '#F2641520',     pct: 75  }
  return                 { label: 'Hazardous',  color: '#EF4444',    bg: '#EF444420',     pct: 100 }
}

function Skeleton() {
  return (
    <div className="card" style={{ height: '144px' }}>
      <div className="animate-shimmer" style={{ height: '16px', width: '96px', borderRadius: '4px', marginBottom: '12px' }}/>
      <div className="animate-shimmer" style={{ height: '32px', width: '64px', borderRadius: '4px', marginBottom: '8px' }}/>
      <div className="animate-shimmer" style={{ height: '12px', width: '144px', borderRadius: '4px' }}/>
    </div>
  )
}

export default function AQICard() {
  const { data, loading, error, refetch } = usePolling('/api/aqi', 1_800_000)
  const animated = useCountUp(data?.aqi, 1200)

  if (loading) return <Skeleton />

  if (error) return (
    <div className="card" style={{ height: '144px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Air quality (AQI)</span>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Unavailable</p>
      <button onClick={refetch}
        style={{ color: 'var(--accent)', fontSize:'12px', background:'transparent',
                 border:'none', cursor:'pointer', padding:0, textDecoration:'underline', textAlign: 'left' }}>
        Retry
      </button>
    </div>
  )

  const level = getAQILevel(data?.aqi)

  return (
    <div className="card animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Air quality (AQI)</span>
        <div style={{ width: '10px', height: '10px', borderRadius: '9999px', background: level.color, boxShadow: `0 0 0 4px ${level.bg}` }}/>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '4px' }}>
        <span className="metric-value">{Math.round(animated)}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '2px' }}>AQI</span>
      </div>

      <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: level.color }}>{level.label}</p>

      <div style={{ display: 'flex', gap: '12px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
        <span>PM2.5: {data?.pm25 ?? '—'}</span>
        <span>PM10: {data?.pm10 ?? '—'}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
          {data?.station_name?.replace('Bhubaneswar', 'Bbsr') ?? ''}
        </span>
      </div>
    </div>
  )
}
