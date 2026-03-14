'use client'
import { usePolling, useCountUp } from '@/lib/hooks'

function getAQILevel(aqi) {
  if (!aqi) return { label: 'No data',   color: 'text-slate-500', bg: 'bg-slate-700', pct: 0 }
  if (aqi <= 50)  return { label: 'Good',       color: 'text-emerald-400', bg: 'bg-emerald-500', pct: 15  }
  if (aqi <= 100) return { label: 'Moderate',   color: 'text-yellow-400',  bg: 'bg-yellow-400',  pct: 35  }
  if (aqi <= 150) return { label: 'Unhealthy (sensitive)', color: 'text-orange-400', bg: 'bg-orange-400', pct: 55  }
  if (aqi <= 200) return { label: 'Unhealthy',  color: 'text-red-400',    bg: 'bg-red-500',     pct: 75  }
  return                 { label: 'Hazardous',  color: 'text-red-600',    bg: 'bg-red-700',     pct: 100 }
}

function Skeleton() {
  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36">
      <div className="animate-shimmer h-4 w-24 rounded mb-3"/>
      <div className="animate-shimmer h-8 w-16 rounded mb-2"/>
      <div className="animate-shimmer h-3 w-36 rounded"/>
    </div>
  )
}

export default function AQICard() {
  const { data, loading, error, refetch } = usePolling('/api/aqi', 1_800_000)
  const animated = useCountUp(data?.aqi, 1200)

  if (loading) return <Skeleton />

  if (error) return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 h-36
                    flex flex-col justify-between">
      <span className="text-slate-400 text-sm">Air quality (AQI)</span>
      <p className="text-slate-500 text-sm">Unavailable — check DATA_GOV_IN_KEY</p>
      <button onClick={refetch}
        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline text-left">
        Retry
      </button>
    </div>
  )

  const level = getAQILevel(data?.aqi)

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5
                    hover:border-slate-500 transition-all duration-200 animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-400 text-sm font-medium">Air quality (AQI)</span>
        <div className={`w-2.5 h-2.5 rounded-full ${level.bg}`}/>
      </div>

      <div className="flex items-end gap-1 mb-1">
        <span className="text-2xl font-bold text-white">{Math.round(animated)}</span>
        <span className="text-slate-400 text-sm mb-0.5">AQI</span>
      </div>

      <p className={`text-sm font-medium mb-3 ${level.color}`}>{level.label}</p>

      <div className="flex gap-3 text-xs text-slate-400">
        <span>PM2.5: {data?.pm25 ?? '—'}</span>
        <span>PM10: {data?.pm10 ?? '—'}</span>
        <span className="ml-auto opacity-60 truncate max-w-[90px]">
          {data?.station_name?.replace('Bhubaneswar', 'Bbsr') ?? ''}
        </span>
      </div>
    </div>
  )
}