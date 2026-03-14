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
  if (!wm2) return { label: 'No data', color: 'text-slate-500', bar: 0 }
  if (wm2 >= 700) return { label: 'Very high',  color: 'text-orange-400', bar: 100 }
  if (wm2 >= 400) return { label: 'High',       color: 'text-amber-400',  bar: 70  }
  if (wm2 >= 150) return { label: 'Moderate',   color: 'text-yellow-400', bar: 40  }
  return              { label: 'Low',         color: 'text-blue-400',   bar: 15  }
}

function SkeletonCard() {
  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36">
      <div className="animate-shimmer h-4 w-32 rounded mb-3"/>
      <div className="animate-shimmer h-8 w-24 rounded mb-2"/>
      <div className="animate-shimmer h-3 w-40 rounded"/>
    </div>
  )
}

export default function SolarCard() {
  const { data, loading, error, refetch } = usePolling('/api/solar', 300_000)
  const animated = useCountUp(data?.irradiance_wm2, 1000)

  if (loading) return <SkeletonCard />

  if (error) return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36
                    flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-sm">Solar Irradiance</span>
        <span className="text-amber-400">{SUN_ICON}</span>
      </div>
      <p className="text-slate-500 text-sm">Data unavailable</p>
      <button onClick={refetch}
        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors
                   underline underline-offset-2 text-left">
        Retry
      </button>
    </div>
  )

  const level = getLevel(data?.irradiance_wm2)
  const updated = data?.timestamp
    ? new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5
                    hover:border-slate-500 transition-all duration-200 animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-400 text-sm font-medium">Solar irradiance</span>
        <div className="flex items-center gap-2">
          <span className="live-indicator"/>
          <span className="text-amber-400">{SUN_ICON}</span>
        </div>
      </div>

      <div className="flex items-end gap-1 mb-1">
        <span className="text-2xl font-bold text-white">
          {Math.round(animated)}
        </span>
        <span className="text-slate-400 text-sm mb-0.5">W/m²</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-1000"
            style={{ width: `${level.bar}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3 text-xs text-slate-400">
        <span>☁ {data?.cloud_cover_pct ?? '—'}%</span>
        <span>🌡 {data?.temp_c ?? '—'}°C</span>
        <span className="ml-auto opacity-60">{updated}</span>
      </div>
    </div>
  )
}