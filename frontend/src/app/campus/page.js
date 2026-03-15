'use client'
import { useEffect, useState, useRef } from 'react'
import { useFetch } from '@/lib/hooks'

const CAMPUS_CENTER = [85.8252, 20.2961]

const BUILDING_COORDS = {
  CSE:  [85.8268, 20.2972],
  ECE:  [85.8255, 20.2965],
  LIB:  [85.8245, 20.2960],
  ADM:  [85.8240, 20.2980],
  MEC:  [85.8275, 20.2955],
  HOS1: [85.8230, 20.2950],
  HOS2: [85.8228, 20.2945],
  CAF:  [85.8252, 20.2948],
  SPT:  [85.8285, 20.2940],
  SCI:  [85.8260, 20.2975],
}

function kwhToColor(kwh) {
  if (!kwh || kwh < 150) return '#10B981'
  if (kwh < 300)         return '#F59E0B'
  return '#EF4444'
}
function kwhLabel(kwh) {
  if (!kwh || kwh < 150) return 'Low'
  if (kwh < 300)         return 'Medium'
  return 'High'
}

function SolarBar({ solar }) {
  if (!solar) return null
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 card
                    border border-slate-700 rounded-xl px-5 py-3 text-sm animate-fadeIn">
      <div className="flex items-center gap-2">
        <span className="live-indicator"/>
        <span className="text-slate-400">Solar</span>
        <span className="font-semibold text-white">{solar.irradiance_wm2} W/mÂ²</span>
      </div>
      <div>
        <span className="text-slate-400">Cloud </span>
        <span className="font-semibold text-white">{solar.cloud_cover_pct}%</span>
      </div>
      <div>
        <span className="text-slate-400">Temp </span>
        <span className="font-semibold text-white">{solar.temp_c}Â°C</span>
      </div>
      <span className="ml-auto text-xs text-slate-500">
        Updated {solar.timestamp
          ? new Date(solar.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : 'â€”'}
      </span>
    </div>
  )
}

function Leaderboard({ buildings }) {
  if (!buildings?.length) return null
  const sorted = [...buildings].sort((a, b) => (b.consumption_kwh ?? 0) - (a.consumption_kwh ?? 0))
  return (
    <div className="card rounded-xl p-4 animate-fadeIn">
      <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
        Energy leaderboard
      </h3>
      <div className="space-y-2">
        {sorted.map((b, i) => {
          const kwh = b.consumption_kwh ?? 0
          const max = sorted[0]?.consumption_kwh ?? 1
          const pct = Math.round((kwh / max) * 100)
          const color = kwhToColor(kwh)
          return (
            <div key={b.building_id} className="flex items-center gap-3">
              <span className="text-slate-500 text-xs w-4 text-right">{i + 1}</span>
              <span className="text-slate-300 text-xs w-10 shrink-0">
                {b.buildings?.code ?? 'â€”'}
              </span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className="text-xs font-medium text-white w-14 text-right shrink-0">
                {kwh.toFixed(0)} kWh
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CampusPage() {
  const mapRef         = useRef(null)
  const mapInstanceRef = useRef(null)
  const [mapboxReady, setMapboxReady] = useState(false)
  const { data, loading } = useFetch('/api/campus-map')

  const buildings = data?.buildings ?? []
  const solar     = data?.solar ?? null

  useEffect(() => {
    import('mapbox-gl').then(mod => {
      window._mapboxgl = mod.default
      const link = document.createElement('link')
      link.rel  = 'stylesheet'
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
      document.head.appendChild(link)
      setMapboxReady(true)
    })
  }, [])

  useEffect(() => {
    if (!mapboxReady || !buildings.length || !mapRef.current || mapInstanceRef.current) return
    const mapboxgl = window._mapboxgl
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: CAMPUS_CENTER,
      zoom: 16,
      pitch: 30,
      bearing: -10,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    map.on('load', () => {
      buildings.forEach(b => {
        const code   = b.buildings?.code
        const coords = BUILDING_COORDS[code]
        if (!coords) return
        const kwh   = b.consumption_kwh
        const color = kwhToColor(kwh)
        const el    = document.createElement('div')
        el.style.cssText = [
          `background:${color}`, 'border:2.5px solid white',
          'border-radius:50%', 'width:16px', 'height:16px',
          `box-shadow:0 0 0 4px ${color}33`, 'cursor:pointer',
          'transition:transform .15s'
        ].join(';')
        el.onmouseenter = () => { el.style.transform = 'scale(1.4)' }
        el.onmouseleave = () => { el.style.transform = 'scale(1)' }

        new mapboxgl.Marker({ element: el })
          .setLngLat(coords)
          .setPopup(new mapboxgl.Popup({ offset: 18, closeButton: false })
            .setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px 6px;min-width:150px">
                <p style="font-weight:600;margin:0 0 2px;font-size:13px;color:#F1F5F9">
                  ${b.buildings?.name ?? code}
                </p>
                <p style="margin:0 0 6px;font-size:11px;color:#64748B;text-transform:capitalize">
                  ${b.buildings?.type ?? ''}
                </p>
                <hr style="border-color:#334155;margin:0 0 6px"/>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:13px;color:#F1F5F9">
                    âš¡ <strong>${kwh?.toFixed(1) ?? 'â€”'} kWh</strong>
                  </span>
                  <span style="
                    background:${color}22;color:${color};
                    font-size:10px;padding:1px 7px;border-radius:999px
                  ">${kwhLabel(kwh)}</span>
                </div>
              </div>
            `))
          .addTo(map)
      })
    })

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [mapboxReady, buildings])

  return (
    <div className="p-6 space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-semibold text-white">Campus map</h1>
        <p className="text-slate-400 text-sm mt-1">
          Live energy overlay on satellite imagery Â· hover markers for details
        </p>
      </div>

      <SolarBar solar={solar}/>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="relative rounded-xl overflow-hidden border border-slate-700"
             style={{ height: 500 }}>
          {loading && (
            <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-shimmer h-6 w-40 rounded"/>
                <p className="text-slate-500 text-sm">Loading campus dataâ€¦</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full"/>
        </div>

        <Leaderboard buildings={buildings}/>
      </div>

      <div className="flex flex-wrap gap-5 text-xs text-slate-400">
        {[
          { color: '#10B981', label: 'Low (<150 kWh)' },
          { color: '#F59E0B', label: 'Medium (150â€“300 kWh)' },
          { color: '#EF4444', label: 'High (>300 kWh)' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }}/>
            {label}
          </span>
        ))}
        <span className="text-slate-600 ml-auto">Click any marker for building detail</span>
      </div>
    </div>
  )
}