---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Campus Map Upgrade: Mapbox Standard + 3D + Dynamic Lighting

<tasks>
<task type="edit">
  <name>Task 1: Upgrade campus map to Mapbox Standard style with 3D buildings and dynamic lighting</name>
  <files>frontend/src/app/campus/page.js</files>
  <action>
    IMPORTANT FOR STEP 3.5 FLASH:
    - This file uses dynamic import of mapbox-gl inside useEffect. Keep that pattern.     
    - Never import mapbox-gl at the top of the file — SSR will crash.
    - Write every function completely. Do not use placeholders or ellipsis.
    - The map initialisation happens inside useEffect with deps [mapboxReady, buildings]. 

    Replace the ENTIRE file content with the following.
    Keep the existing useFetch import from '@/lib/hooks'.
    Keep the existing BUILDING_COORDS and CAMPUS_CENTER constants.
    Keep the existing SolarBar and Leaderboard sub-components.
    Only replace the map initialisation logic and its configuration.

    === FULL REPLACEMENT FOR MAP INITIALISATION useEffect ===

    Replace the useEffect that calls `new mapboxgl.Map(...)` with this exact code:        

    ```javascript
    useEffect(() => {
      if (!mapboxReady || !mapRef.current || mapInstanceRef.current) return

      const mapboxgl = window._mapboxgl
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

      // —— 1. Initialise with Mapbox Standard style ——————————————————————————
      const map = new mapboxgl.Map({
        container:  mapRef.current,
        style:      'mapbox://styles/mapbox/standard',   // Standard — NOT satellite    
        center:     CAMPUS_CENTER,
        zoom:       15.5,
        pitch:      55,          // tilted view shows 3D buildings well
        bearing:    -15,
        antialias:  true,        // required for smooth 3D building edges
      })

      mapInstanceRef.current = map

      // —— 2. Controls ———————————————————————————————————————————————————————
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      // —— 3. Apply Standard style config immediately (before load) ——————————
      // Theme: 'monochrome' makes the basemap near-black, perfect for dark dashboard     
      // lightPreset: drives the entire lighting rig — 'night' for dramatic 3D
      map.on('style.load', () => {

        // --- Dark monochrome basemap ---
        map.setConfigProperty('basemap', 'theme', 'monochrome')
        map.setConfigProperty('basemap', 'lightPreset', 'night')

        // --- Enable all landmark 3D buildings (Standard style built-in) ---
        // Standard style renders 3D buildings natively — no custom layer needed.       
        // Show POI labels for campus landmarks:
        map.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
        map.setConfigProperty('basemap', 'showTransitLabels', false)
        map.setConfigProperty('basemap', 'showPlaceLabels', true)
        map.setConfigProperty('basemap', 'showRoadLabels', false)

        // --- Fog / Atmosphere for depth ---
        map.setFog({
          color:            'rgb(10, 10, 10)',      // matches --bg-base
          'high-color':     'rgb(20, 20, 20)',
          'horizon-blend':  0.04,
          'space-color':    'rgb(5, 5, 5)',
          'star-intensity': 0.6,
        })

        // —— 4. Add energy consumption heatmap layer ——————————————————————————
        // Buildings data as GeoJSON — construct from the buildings prop
        // Each feature has consumption_kwh as a property for color interpolation
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

          // Add GeoJSON source
          map.addSource('campus-energy', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: geojsonFeatures }
          })

          // Halo glow layer (large, soft, color-coded)
          map.addLayer({
            id:     'energy-glow',
            type:   'circle',
            source: 'campus-energy',
            paint: {
              'circle-radius':       28,
              'circle-blur':         0.8,
              'circle-opacity':      0.35,
              'circle-color': [
                'interpolate', ['linear'], ['get', 'kwh'],
                0,   '#10B981',
                150, '#F59E0B',
                300, '#EF4444',
              ],
            }
          })

          // Core dot layer (sharp center dot, color-coded)
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

          // —— 5. Interactive popups on dot click —————————————————————————————
          map.on('click', 'energy-dots', (e) => {
            if (!e.features?.length) return
            const f    = e.features[0]
            const props = f.properties
            const coords = e.lngLat

            new mapboxgl.Popup({
              offset:      20,
              closeButton: false,
              maxWidth:    '200px',
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
                  <p style="margin:0 0 2px; font-size:13px; font-weight:600;">
                    ${props.name}
                  </p>
                  <p style="margin:0 0 8px; font-size:11px; color:#8A8A8A;
                             text-transform:uppercase; letter-spacing:0.05em;">
                    ${props.type}
                  </p>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:20px; font-weight:600;
                                 letter-spacing:-0.02em;">
                      ${Number(props.kwh).toFixed(1)}
                    </span>
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

          // Pointer cursor on hover
          map.on('mouseenter', 'energy-dots', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', 'energy-dots', () => {
            map.getCanvas().style.cursor = ''
          })
        }

        // —— 6. Dynamic lighting — auto-cycle based on time of day ——————————
        // Determine IST hour and pick appropriate light preset
        const getLocalLightPreset = () => {
          const hour = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            hour12: false
          })
          const h = parseInt(hour, 10)
          if (h >= 6  && h < 9)  return 'dawn'
          if (h >= 9  && h < 18) return 'day'
          if (h >= 18 && h < 20) return 'dusk'
          return 'night'
        }

        const preset = getLocalLightPreset()
        map.setConfigProperty('basemap', 'lightPreset', preset)

        // Store on window so the lighting controls can update it
        window._mapLightPreset = preset
      })

      // Cleanup
      return () => {
        map.remove()
        mapInstanceRef.current = null
      }
    }, [mapboxReady, buildings])
    ```

    === ALSO ADD — Lighting controls UI below the map ===

    In the JSX return, after the map container div and before the legend row,
    add this lighting controls bar:

    ```jsx
    {/* Lighting preset switcher */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      background: '#111111',
      border: '1px solid #1F1F1F',
      borderRadius: '10px',
    }}>
      <span style={{
        fontSize: '11px',
        fontWeight: 400,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#4A4A4A',
        marginRight: '4px'
      }}>
        Lighting
      </span>
      {[
        { id: 'dawn',  label: 'Dawn'  },
        { id: 'day',   label: 'Day'   },
        { id: 'dusk',  label: 'Dusk'  },
        { id: 'night', label: 'Night' },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => {
            const m = mapInstanceRef.current
            if (!m) return
            m.setConfigProperty('basemap', 'lightPreset', id)
            window._mapLightPreset = id
            // Force re-render of active state
            setActiveLightPreset(id)
          }}
          style={{
            padding:         '5px 12px',
            borderRadius:    '999px',
            fontSize:        '12px',
            fontWeight:      500,
            cursor:          'pointer',
            transition:      'all 0.15s',
            border:          '1px solid',
            fontFamily:      'Urbanist, sans-serif',
            background:      activeLightPreset === id ? '#3E3E3E' : 'transparent',        
            color:           activeLightPreset === id ? '#FFFFFF'  : '#8A8A8A',
            borderColor:     activeLightPreset === id ? '#3E3E3E'  : '#1F1F1F',
          }}
        >
          {label}
        </button>
      ))}
    </div>
    ```

    === ALSO ADD — activeLightPreset state ===

    At the top of the CampusPage component, alongside existing useState calls, add:       

    ```javascript
    const [activeLightPreset, setActiveLightPreset] = useState('night')
    ```

    Initialize it to match the time-based logic by adding a useEffect:

    ```javascript
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
    ```

    === ALSO UPDATE — Map container height and pitch ===

    Update the map container div style to:
    ```javascript
    style={{ height: 560, position: 'relative', borderRadius: '12px',
             overflow: 'hidden', border: '1px solid #1F1F1F' }}
    ```

    === ALSO UPDATE — Mapbox popup CSS override ===

    Add this to globals.css (APPEND at the end — do not replace existing content):      

    ```css
    /* Override Mapbox default popup chrome for dark theme */
    .mapboxgl-popup-content {
      background: transparent !important;
      padding: 0 !important;
      box-shadow: none !important;
      border-radius: 10px !important;
    }
    .mapboxgl-popup-tip {
      display: none !important;
    }
    .mapboxgl-ctrl-group {
      background: #111111 !important;
      border: 1px solid #1F1F1F !important;
      border-radius: 8px !important;
    }
    .mapboxgl-ctrl-group button {
      background: #111111 !important;
      border-bottom: 1px solid #1F1F1F !important;
    }
    .mapboxgl-ctrl-group button:last-child {
      border-bottom: none !important;
    }
    .mapboxgl-ctrl-icon {
      filter: invert(1) opacity(0.5) !important;
    }
    .mapboxgl-ctrl-icon:hover {
      filter: invert(1) opacity(1) !important;
    }
    ```
  </action>
</task>
</tasks>