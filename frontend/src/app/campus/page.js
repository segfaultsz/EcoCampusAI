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
    <div className="card animate-fadeIn"
         style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px 24px', fontSize:'13px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <span className="live-indicator"/>
        <span style={{ color:'var(--text-secondary)' }}>Solar</span>
        <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{solar.irradiance_wm2} W/m²</span>
      </div>
      <div>
        <span style={{ color:'var(--text-secondary)' }}>Cloud </span>
        <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{solar.cloud_cover_pct}%</span>
      </div>
      <div>
        <span style={{ color:'var(--text-secondary)' }}>Temp </span>
        <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{solar.temp_c}°C</span>
      </div>
      <span style={{ marginLeft:'auto', fontSize:'11px', color:'var(--text-tertiary)' }}>
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
    <div className="card animate-fadeIn" style={{ padding:'16px' }}>
      <h3 className="metric-label" style={{ marginBottom:'12px' }}>
        Energy leaderboard
      </h3>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {sorted.map((b, i) => {
          const kwh = b.consumption_kwh ?? 0
          const max = sorted[0]?.consumption_kwh ?? 1
          const pct = Math.round((kwh / max) * 100)
          const color = kwhToColor(kwh)
          return (
            <div key={b.building_id} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ color:'var(--text-tertiary)', fontSize:'12px', width:'16px', textAlign:'right' }}>{i + 1}</span>
              <span style={{ color:'var(--text-secondary)', fontSize:'12px', width:'40px', flexShrink:0 }}>
                {b.buildings?.code ?? '—'}
              </span>
              <div style={{ flex:1, height:'6px', background:'var(--border)', borderRadius:'999px', overflow:'hidden' }}>
                <div
                  style={{ height:'100%', borderRadius:'999px', transition:'all 1s', width:`${pct}%`, background:color }}
                />
              </div>
              <span style={{ fontSize:'12px', fontWeight:500, color:'var(--text-primary)', width:'56px', textAlign:'right', flexShrink:0 }}>
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
      // Mapbox Standard style — native 3D buildings, dynamic lighting
      const map = new mapboxgl.Map({
        container:  mapRef.current,
        style:      'mapbox://styles/mapbox/standard',
        center:     CAMPUS_CENTER,
        zoom:       15.5,
        pitch:      55,
        bearing:    -15,
        antialias:  true,
      })

      mapInstanceRef.current = map

      // Controls
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      map.on('style.load', () => {
        // Dark monochrome basemap with dynamic lighting
        map.setConfigProperty('basemap', 'theme', 'monochrome')
        map.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
        map.setConfigProperty('basemap', 'showTransitLabels', false)
        map.setConfigProperty('basemap', 'showPlaceLabels', true)
        map.setConfigProperty('basemap', 'showRoadLabels', false)

        // Time-based lighting
        const getPreset = () => {
          const h = parseInt(new Date().toLocaleString('en-US', { timeZone:'Asia/Kolkata', hour:'numeric', hour12:false }), 10)
          if (h >= 6  && h < 9)  return 'dawn'
          if (h >= 9  && h < 18) return 'day'
          if (h >= 18 && h < 20) return 'dusk'
          return 'night'
        }
        const preset = getPreset()
        map.setConfigProperty('basemap', 'lightPreset', preset)
        setActiveLightPreset(preset)

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
    <div style={{ padding:'28px', minHeight:'100vh', background:'var(--bg-base)' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize:'28px', fontWeight:600, letterSpacing:'-0.02em', color:'var(--text-primary)', marginBottom:'4px' }}>Campus map</h1>
        <p style={{ fontSize:'13px', color:'var(--text-secondary)', fontWeight:400 }}>
          Live energy overlay · hover markers for details
        </p>
      </div>
      <div style={{ height:'1px', background:'var(--border)', margin:'16px 0 24px' }}/>

      <SolarBar solar={solar}/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'16px' }}>
        <div style={{ height:560, position:'relative', borderRadius:'12px',
                      overflow:'hidden', border:'1px solid var(--border)' }}>
          {loading && (
            <div style={{ position:'absolute', inset:0, background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
                <div className="animate-shimmer" style={{ height:'24px', width:'160px', borderRadius:'4px' }}/>
                <p style={{ color:'var(--text-secondary)', fontSize:'13px' }}>Loading campus data…</p>
              </div>
            </div>
          )}
          {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && !loading && (
            <div style={{ position:'absolute', inset:0, background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', textAlign:'center', padding:'0 24px' }}>
                <span style={{ fontSize:'24px' }}>🗺️</span>
                <p style={{ color:'var(--text-secondary)', fontSize:'13px', fontWeight:500 }}>Campus Map Unavailable</p>
                <p style={{ color:'var(--text-tertiary)', fontSize:'12px', maxWidth:'280px' }}>
                  Set <code style={{ color:'var(--accent)' }}>NEXT_PUBLIC_MAPBOX_TOKEN</code> in your
                  <code style={{ color:'var(--accent)' }}> .env.local</code> file to enable the interactive map.
                </p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full"/>
        </div>

        <Leaderboard buildings={buildings}/>
      </div>

      {/* Lighting preset switcher */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px',
                    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'10px' }}>
        <span className="metric-label" style={{ marginRight:'4px' }}>Lighting</span>
        {[{ id:'dawn', label:'Dawn' }, { id:'day', label:'Day' }, { id:'dusk', label:'Dusk' }, { id:'night', label:'Night' }].map(({ id, label }) => (
          <button key={id} onClick={() => {
            const m = mapInstanceRef.current
            if (!m) return
            m.setConfigProperty('basemap', 'lightPreset', id)
            setActiveLightPreset(id)
          }}
          style={{
            padding:'5px 12px', borderRadius:'999px', fontSize:'12px', fontWeight:500,
            cursor:'pointer', transition:'all 0.15s', fontFamily:'Urbanist, sans-serif',
            border:'1px solid',
            background: activeLightPreset === id ? 'var(--charcoal)' : 'transparent',
            color: activeLightPreset === id ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderColor: activeLightPreset === id ? 'var(--charcoal)' : 'var(--border)',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'20px', fontSize:'12px', color:'var(--text-secondary)' }}>
        {[
          { color: '#10B981', label: 'Low (<150 kWh)' },
          { color: '#F59E0B', label: 'Medium (150–300 kWh)' },
          { color: '#EF4444', label: 'High (>300 kWh)' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <span style={{ display:'inline-block', width:'10px', height:'10px', borderRadius:'50%', background:color }}/>
            {label}
          </span>
        ))}
        <span style={{ color:'var(--text-tertiary)', marginLeft:'auto' }}>Click any marker for building detail</span>
      </div>
    </div>
  )
}