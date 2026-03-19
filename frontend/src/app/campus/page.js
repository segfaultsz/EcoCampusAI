'use client'
import { useEffect, useState, useRef } from 'react'
import { useFetch } from '@/lib/hooks'

const CAMPUS_CENTER = [84.74472, 19.19917]

const BUILDING_COORDS = {
  LHC: [84.744911, 19.199229],
  OCT: [84.745132, 19.197689],
  ATR: [84.746072, 19.196929],
  STD: [84.746786, 19.198222],
  GAL: [84.743460, 19.198586],
  GH1: [84.742656, 19.198184],
  MWS: [84.745398, 19.199634],
  BH1: [84.748474, 19.197603],
  BH2: [84.748228, 19.198411],
  TIF: [84.745187, 19.199991],
  COR: [84.745612, 19.200053],
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
        <span className="font-semibold text-white">{solar.irradiance_wm2} W/m²</span>
      </div>
      <div>
        <span className="text-slate-400">Cloud </span>
        <span className="font-semibold text-white">{solar.cloud_cover_pct}%</span>
      </div>
      <div>
        <span className="text-slate-400">Temp </span>
        <span className="font-semibold text-white">{solar.temp_c}°C</span>
      </div>
      <span className="ml-auto text-xs text-slate-500">
        Updated {solar.timestamp
          ? new Date(solar.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : '—'}
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
                {b.buildings?.code ?? '—'}
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
  const [activeLightPreset, setActiveLightPreset] = useState('night')
  const { data, loading } = useFetch('/api/campus-map')

  const buildings = data?.buildings ?? []
  const solar     = data?.solar ?? null

  useEffect(() => {
    const hour = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false
    })
    const h = parseInt(hour, 10)
    if (h >= 6  && h < 9)  setActiveLightPreset('dawn')
    else if (h >= 9  && h < 18) setActiveLightPreset('day')
    else if (h >= 18 && h < 20) setActiveLightPreset('dusk')
    else setActiveLightPreset('night')
  }, [])

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
    if (!mapboxReady || !mapRef.current || mapInstanceRef.current) return

    const mapboxgl = window._mapboxgl
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    // Guard: if no token, skip map init — the UI will show a fallback message
    if (!token) {
      console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is not set — campus map disabled')
      return
    }

    mapboxgl.accessToken = token

    try {
      // Use dark-v11 instead of 'standard' to avoid 3D model loading errors
      // (Standard style requires authenticated model endpoint for oak/tree LOD meshes)
      const map = new mapboxgl.Map({
        container:  mapRef.current,
        style:      'mapbox://styles/mapbox/dark-v11',
        center:     CAMPUS_CENTER,
        zoom:       16.5,
        pitch:      55,
        bearing:    -15,
        antialias:  true,
      })

      mapInstanceRef.current = map

      // Controls
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      map.on('style.load', () => {
        // Add 3D building extrusions (works with dark-v11 without model dependency)
        const layers = map.getStyle().layers
        const labelLayerId = layers?.find(
          l => l.type === 'symbol' && l.layout?.['text-field']
        )?.id

        map.addLayer(
          {
            id: 'building-3d',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#1a1a2e',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.7,
            },
          },
          labelLayerId
        )

        // Fog for depth
        map.setFog({
          color:            'rgb(10, 10, 10)',
          'high-color':     'rgb(20, 20, 20)',
          'horizon-blend':  0.04,
          'space-color':    'rgb(5, 5, 5)',
          'star-intensity': 0.6,
        })

        // Energy overlay layers (same as before)
        if (buildings && buildings.length > 0) {
          const geojsonFeatures = buildings
            .filter(b => BUILDING_COORDS[b.buildings?.code])
            .map(b => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: BUILDING_COORDS[b.buildings?.code]
              },
              properties: {
                code:    b.buildings?.code ?? '',
                name:    b.buildings?.name ?? '',
                type:    b.buildings?.type ?? '',
                kwh:     b.consumption_kwh ?? 0,
                color:   kwhToColor(b.consumption_kwh),
                label:   kwhLabel(b.consumption_kwh),
              }
            }))

          map.addSource('campus-energy', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: geojsonFeatures }
          })

          map.addLayer({
            id:     'energy-glow',
            type:   'circle',
            source: 'campus-energy',
            paint: {
              'circle-radius':  28,
              'circle-blur':    0.8,
              'circle-opacity': 0.35,
              'circle-color': [
                'interpolate', ['linear'], ['get', 'kwh'],
                0,   '#10B981',
                150, '#F59E0B',
                300, '#EF4444',
              ],
            }
          })

          map.addLayer({
            id:     'energy-dots',
            type:   'circle',
            source: 'campus-energy',
            paint: {
              'circle-radius':        8,
              'circle-color': [
                'interpolate', ['linear'], ['get', 'kwh'],
                0,   '#10B981',
                150, '#F59E0B',
                300, '#EF4444',
              ],
              'circle-stroke-width':  2,
              'circle-stroke-color':  '#FFFFFF',
              'circle-stroke-opacity': 0.9,
            }
          })

          // Popups
          map.on('click', 'energy-dots', (e) => {
            if (!e.features?.length) return
            const f = e.features[0]
            const props = f.properties
            const coords = e.lngLat

            new mapboxgl.Popup({
              offset: 20,
              closeButton: false,
              maxWidth: '200px',
            })
              .setLngLat(coords)
              .setHTML(`
                <div style="
                  font-family: Urbanist, sans-serif;
                  background: #111111;
                  border: 1px solid #1F1F1F;
                  border-radius: 10px;
                  padding: 12px 14px;
                  color: #FFFFFF;
                ">
                  <p style="margin:0 0 2px; font-size:13px; font-weight:600;">${props.name}</p>
                  <p style="margin:0 0 8px; font-size:11px; color:#8A8A8A;
                     text-transform:uppercase; letter-spacing:0.05em;">${props.type}</p>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:20px; font-weight:600;
                         letter-spacing:-0.02em;">${Number(props.kwh).toFixed(1)}</span>
                    <span style="font-size:11px; color:#8A8A8A;">kWh</span>
                    <span style="
                      margin-left:auto;
                      background: ${props.color}20;
                      color: ${props.color};
                      border-radius: 4px;
                      padding: 2px 7px;
                      font-size: 10px;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.04em;
                    ">${props.label}</span>
                  </div>
                </div>
              `)
              .addTo(map)
          })

          map.on('mouseenter', 'energy-dots', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', 'energy-dots', () => {
            map.getCanvas().style.cursor = ''
          })
        }
      })

      // Error handler for any Mapbox runtime errors
      map.on('error', (e) => {
        console.warn('Mapbox error (non-fatal):', e.error?.message || e.message)
      })

    } catch (err) {
      console.error('Failed to initialize Mapbox map:', err)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mapboxReady, buildings])

  return (
    <div className="p-6 space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-semibold text-white">Campus map</h1>
        <p className="text-slate-400 text-sm mt-1">
          Live energy overlay on satellite imagery · hover markers for details
        </p>
      </div>

      <SolarBar solar={solar}/>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="relative rounded-xl overflow-hidden border border-slate-700"
             style={{ height: 560, position: 'relative', borderRadius: '12px',
             overflow: 'hidden', border: '1px solid #1F1F1F' }}>
          {loading && (
            <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-shimmer h-6 w-40 rounded"/>
                <p className="text-slate-500 text-sm">Loading campus data…</p>
              </div>
            </div>
          )}
          {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && !loading && (
            <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <span className="text-2xl">🗺️</span>
                <p className="text-slate-400 text-sm font-medium">Campus Map Unavailable</p>
                <p className="text-slate-500 text-xs max-w-xs">
                  Set <code className="text-emerald-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your
                  <code className="text-emerald-400"> .env.local</code> file to enable the interactive map.
                </p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full"/>
        </div>

        <Leaderboard buildings={buildings}/>
      </div>

      {/* Lighting controls only work with Mapbox Standard style — hidden for dark-v11 */}

      <div className="flex flex-wrap gap-5 text-xs text-slate-400">
        {[
          { color: '#10B981', label: 'Low (<150 kWh)' },
          { color: '#F59E0B', label: 'Medium (150–300 kWh)' },
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