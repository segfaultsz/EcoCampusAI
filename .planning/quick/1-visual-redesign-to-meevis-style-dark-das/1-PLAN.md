---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Visual Redesign to Meevis-Style Dark Dashboard

## DESIGN BRIEF — READ THIS FIRST BEFORE TOUCHING ANY CODE

You are redesigning the EcoCampus AI frontend from its current emerald-green dark theme
to a premium minimal dark dashboard aesthetic. The target look is:

- Near-black backgrounds, white large numbers, tiny muted labels
- Orange (#F26415) as the ONLY accent color — used sparingly on chart lines,
  colored dots, active states, and key highlights
- Urbanist font family (geometric, clean, slightly spaced)
- Cards with subtle 1px borders, generous inner padding, expand arrow (↗) top-right
- No gradients on UI chrome — only on data visualisations where meaningful
- Semi-circle gauge charts, thin sparkline charts inside cards
- Top navigation pill tab switcher (Overview / Analytics / Monitoring style)
- Every metric card: tiny uppercase muted label top-left, large bold white number,
  tiny sub-metric rows with colored bullet dots

**Reference color palette (replace ALL existing tokens):**
| Token name         | Hex value | Usage |
|--------------------|-----------|-------|
| --bg-base          | #0A0A0A   | Page background |
| --bg-card          | #111111   | Card backgrounds |
| --bg-card-hover    | #161616   | Card hover state |
| --border           | #1F1F1F   | All card and divider borders |
| --border-subtle    | #161616   | Subtler inner borders |
| --text-primary     | #FFFFFF   | Large metric numbers, headings |
| --text-secondary   | #8A8A8A   | Labels, subtitles, muted text |
| --text-tertiary    | #4A4A4A   | Timestamps, footnotes |
| --accent           | #F26415   | Orange accent — primary only |
| --accent-dim       | #F2641520 | Orange at 12% opacity for fills |
| --charcoal         | #3E3E3E   | Secondary dark elements |
| --gray-light       | #D2D2D2   | Light borders, dividers in light areas |

**Font:**
- Family: 'Urbanist', sans-serif
- Import via Google Fonts: https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap
- Display numbers (metric cards): weight 600, tracking -0.02em
- Labels: weight 400, uppercase, letter-spacing 0.06em, font-size 11px
- Body: weight 400, font-size 13px
- Headings: weight 600, font-size varies

<tasks>
<task type="edit">
  <name>Task 1: Replace design tokens and font in globals.css and tailwind.config.js</name>
  <files>
    frontend/src/app/globals.css
    frontend/tailwind.config.ts
  </files>
  <action>
    IMPORTANT: Do NOT delete existing animation classes (.animate-fadeIn,
    .animate-shimmer, .live-indicator). Only replace color and font tokens.

    === EDIT globals.css ===

    1. Find and replace the @import or @font-face for the current font.
       Add this at the very top of the file (line 1):
       @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap');

    2. Find the :root { } block (or create one if absent).
       Replace ALL color CSS variables inside :root with exactly these:

       :root {
         --bg-base:         #0A0A0A;
         --bg-card:         #111111;
         --bg-card-hover:   #161616;
         --border:          #1F1F1F;
         --border-subtle:   #161616;
         --text-primary:    #FFFFFF;
         --text-secondary:  #8A8A8A;
         --text-tertiary:   #4A4A4A;
         --accent:          #F26415;
         --accent-dim:      rgba(242, 100, 21, 0.12);
         --charcoal:        #3E3E3E;
         --gray-light:      #D2D2D2;
         --font-main:       'Urbanist', sans-serif;
         --radius-card:     12px;
         --radius-btn:      8px;
         --radius-pill:     999px;
       }

    3. Find the html, body selector (or body selector) and update:
       html, body {
         background-color: var(--bg-base);
         color: var(--text-primary);
         font-family: var(--font-main);
         font-size: 14px;
         -webkit-font-smoothing: antialiased;
       }

    4. Add these utility classes at the end (after all existing classes):

       .card {
         background: var(--bg-card);
         border: 1px solid var(--border);
         border-radius: var(--radius-card);
         padding: 20px;
         transition: border-color 0.15s ease, background 0.15s ease;
       }
       .card:hover {
         background: var(--bg-card-hover);
         border-color: var(--charcoal);
       }
       .metric-label {
         font-size: 11px;
         font-weight: 400;
         letter-spacing: 0.06em;
         text-transform: uppercase;
         color: var(--text-secondary);
       }
       .metric-value {
         font-size: 32px;
         font-weight: 600;
         letter-spacing: -0.02em;
         color: var(--text-primary);
         line-height: 1;
       }
       .metric-value-lg {
         font-size: 48px;
         font-weight: 600;
         letter-spacing: -0.03em;
         color: var(--text-primary);
         line-height: 1;
       }
       .expand-btn {
         width: 24px;
         height: 24px;
         display: flex;
         align-items: center;
         justify-content: center;
         color: var(--text-tertiary);
         cursor: pointer;
         transition: color 0.15s;
       }
       .expand-btn:hover { color: var(--text-secondary); }
       .dot-orange { width:7px; height:7px; border-radius:50%; background:var(--accent); display:inline-block; }
       .dot-white  { width:7px; height:7px; border-radius:50%; background:var(--text-primary); display:inline-block; }
       .dot-gray   { width:7px; height:7px; border-radius:50%; background:var(--charcoal); display:inline-block; }
       .pill-tab-bar {
         display: flex;
         gap: 2px;
         background: var(--bg-card);
         border: 1px solid var(--border);
         border-radius: var(--radius-pill);
         padding: 3px;
       }
       .pill-tab {
         padding: 6px 16px;
         border-radius: var(--radius-pill);
         font-size: 12px;
         font-weight: 500;
         color: var(--text-secondary);
         cursor: pointer;
         transition: all 0.15s;
         background: transparent;
         border: none;
         outline: none;
       }
       .pill-tab.active {
         background: var(--charcoal);
         color: var(--text-primary);
       }
       .pill-tab:hover:not(.active) { color: var(--text-primary); }

    === EDIT tailwind.config.ts ===

    Find the theme.extend section and replace/add these colors and font:

    theme: {
      extend: {
        fontFamily: {
          sans: ['Urbanist', 'sans-serif'],
        },
        colors: {
          'bg-base':       '#0A0A0A',
          'bg-card':       '#111111',
          'bg-hover':      '#161616',
          'border-dark':   '#1F1F1F',
          'border-subtle': '#161616',
          'text-muted':    '#8A8A8A',
          'text-dim':      '#4A4A4A',
          'accent':        '#F26415',
          'charcoal':      '#3E3E3E',
          'gray-light':    '#D2D2D2',
        },
        borderRadius: {
          'card': '12px',
          'pill': '999px',
        },
      }
    }
  </action>
  <verify>
    globals.css starts with Urbanist Google Fonts import
    :root block has ALL 15 CSS variables listed above
    body uses font-family: var(--font-main)
    .card, .metric-label, .metric-value, .pill-tab-bar classes exist
    tailwind.config.ts has accent: '#F26415' and fontFamily Urbanist
    Existing animation classes (.animate-fadeIn etc.) are still present
  </verify>
  <done>Design tokens, font, and utility classes updated to Meevis dark system</done>
</task>

<task type="edit">
  <name>Task 2: Redesign TopBar to match Meevis-style header with pill tab switcher</name>
  <files>frontend/src/components/layout/TopBar.jsx</files>
  <action>
    IMPORTANT: Replace the entire return() JSX of this component.
    Keep all existing props, state, and logic. Only change the visual markup.

    The new TopBar must look exactly like this layout:
    [LEFT]  Logo/brand name in small monospace or light weight
            + current location/subtitle in muted text
    [CENTER] Pill tab bar with 3 tabs: "Overview" | "Analytics" | "Monitoring"
             Active tab has background var(--charcoal), others transparent
    [RIGHT]  Settings icon button + another icon button (logout or refresh)
             Both are square 32x32px, background var(--bg-card),
             border var(--border), border-radius 8px, icon color var(--text-secondary)

    Full replacement JSX — write this exactly:

    The component must:
    1. Import useState from 'react' if not already imported
    2. Have local state: const [activeTab, setActiveTab] = useState('overview')
    3. Return this structure:

    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: '52px',
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: '16px'
    }}>

      {/* LEFT — Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:'180px' }}>
        <span style={{ fontSize:'13px', fontWeight:600, color:'var(--text-primary)',
                       letterSpacing:'0.04em' }}>
          ecocampus
        </span>
        <span style={{ fontSize:'11px', color:'var(--text-secondary)',
                       fontWeight:400 }}>
          GreenTech University
        </span>
      </div>

      {/* CENTER — Pill tab switcher */}
      <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
        <nav className="pill-tab-bar">
          {['overview','analytics','monitoring'].map(tab => (
            <button
              key={tab}
              className={`pill-tab${activeTab===tab?' active':''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* RIGHT — Icon buttons */}
      <div style={{ display:'flex', gap:'8px', minWidth:'180px', justifyContent:'flex-end' }}>
        {/* Settings */}
        <button style={{
          width:'32px', height:'32px', display:'flex', alignItems:'center',
          justifyContent:'center', background:'var(--bg-card)',
          border:'1px solid var(--border)', borderRadius:'8px',
          color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--charcoal)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
          </svg>
        </button>
        {/* Refresh / logout */}
        <button style={{
          width:'32px', height:'32px', display:'flex', alignItems:'center',
          justifyContent:'center', background:'var(--bg-card)',
          border:'1px solid var(--border)', borderRadius:'8px',
          color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--charcoal)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

    </header>

    After the return, add this padding fix so page content is not covered by the fixed header:
    Add a sibling <div style={{height:'52px'}}/> spacer — or ensure the root layout
    already has paddingTop: '52px'. Check frontend/src/app/layout.tsx and add pt-[52px] to main if not present.
  </action>
  <verify>
    TopBar renders a fixed header with height 52px
    Has 3-tab pill switcher in center (Overview, Analytics, Monitoring)
    Has 2 icon buttons on right with hover border-color change
    Brand name on left
    No emerald green colors remain in this file
  </verify>
  <done>TopBar redesigned to Meevis-style pill-tab header</done>
</task>

<task type="edit">
  <name>Task 3: Redesign Sidebar to minimal dark vertical nav</name>
  <files>frontend/src/components/layout/Sidebar.jsx</files>
  <action>
    IMPORTANT: Keep all existing href links and nav item data.
    Replace only the visual styling of the entire component.

    The sidebar must match these exact specs:
    - Width: 200px (not collapsible for now — remove collapse logic if it exists)
    - Background: var(--bg-base)
    - Right border: 1px solid var(--border)
    - Position: fixed, left 0, top 52px (below TopBar), bottom 0
    - No header or logo inside sidebar — that's in TopBar now
    - Nav items: full width, 40px height, flex row, align center, gap 10px
    - Nav item padding: 0 16px
    - Nav item font: 13px, weight 400, color var(--text-secondary)
    - Active nav item: color var(--text-primary), background var(--bg-card),
      border-radius 8px, margin 0 8px, width calc(100% - 16px)
    - Nav item hover: color var(--text-primary)
    - Icon: 16x16px SVG or lucide icon, same color as text
    - No colored accent bar on active item — just the background highlight

    Nav items to include (use existing hrefs):
      Dashboard      icon: grid/home
      Energy         icon: zap/lightning
      Waste          icon: trash
      Predictions    icon: trending-up
      Recommendations icon: check-circle
      Campus Map     icon: map
      Reports        icon: file-text

    Full wrapper structure:
    <aside style={{
      position:'fixed', left:0, top:'52px', bottom:0, width:'200px',
      background:'var(--bg-base)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', padding:'12px 0',
      overflowY:'auto'
    }}>
      <nav style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            style={{
              display:'flex', alignItems:'center', gap:'10px',
              height:'40px',
              padding: isActive ? '0 16px' : '0 16px',
              margin: isActive ? '0 8px' : '0 8px',
              borderRadius:'8px',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize:'13px', fontWeight: isActive ? 500 : 400,
              textDecoration:'none', transition:'all 0.15s',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>

    Also add a main content offset: ensure the main content area in frontend/src/app/layout.tsx
    has marginLeft: '200px' and paddingTop: '52px'.
  </action>
  <verify>
    Sidebar is 200px wide, fixed, starts at top 52px
    Background is #0A0A0A, right border 1px #1F1F1F
    Active item has bg-card background, no colored bar
    All nav items present
    No green/emerald colors remain
  </verify>
  <done>Sidebar redesigned to minimal dark vertical nav</done>
</task>

<task type="edit">
  <name>Task 4: Redesign SummaryCard to Meevis-style metric card</name>
  <files>frontend/src/components/dashboard/SummaryCard.jsx</files>
  <action>
    IMPORTANT: Keep all existing props (title, value, unit, icon, trend, color).
    Replace the entire return() JSX.

    Target visual (based on reference image cards like "Current Power 5.48 kW"):
    - Card outer: className="card" (uses the .card CSS utility we defined)
    - Top row: tiny uppercase label LEFT, expand arrow button RIGHT
    - Large metric number in center-left
    - Unit shown inline after the number in smaller muted text
    - Optional sub-rows below with colored dot + label + value
    - Trend shown as tiny colored text with arrow (↑ orange = good, ↓ red = bad)
    - NO colored top border or colored icon background
    - The only color accent is on the trend indicator and dot icons

    Write the full JSX:

    export default function SummaryCard({ title, value, unit, trend, trendDir, subRows }) {
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
            <span className="metric-value-lg">{value}</span>
            {unit && (
              <span style={{ fontSize:'14px', color:'var(--text-secondary)',
                             fontWeight:400 }}>{unit}</span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div style={{ fontSize:'11px', fontWeight:500,
                          color: trendDir === 'up' ? 'var(--accent)' : '#EF4444',
                          marginBottom:'8px' }}>
              {trendDir === 'up' ? '↑' : '↓'} {trend}
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
      )
    }

    NOTE: If the existing SummaryCard has different prop names, adapt the
    destructuring to match but keep the visual output the same as above.
  </action>
  <verify>
    SummaryCard renders .card div with metric-label, expand-btn, metric-value-lg
    Top row has title label left, expand arrow right
    Trend uses orange (#F26415) for positive, red for negative
    No green/emerald colors
    Sub-rows render with colored dots
  </verify>
  <done>SummaryCard redesigned to Meevis-style metric card</done>
</task>

<task type="edit">
  <name>Task 5: Update all Recharts chart styling to dark minimal theme</name>
  <files>
    frontend/src/components/dashboard/EnergyLineChart.jsx,
    frontend/src/components/dashboard/BuildingBarChart.jsx,
    frontend/src/components/dashboard/WasteDonutChart.jsx,
    frontend/src/components/energy/HeatmapChart.jsx
  </files>
  <action>
    IMPORTANT: Do not change data logic, hooks, or props.
    Only update the visual styling properties inside each Recharts component.
    Apply ALL of these changes to EVERY chart file listed above.

    === RECHARTS GLOBAL STYLE RULES ===

    Apply these exact values to every chart:

    1. CartesianGrid:
       stroke="#1F1F1F" strokeDasharray="0" (no dashes — solid 1px lines, very subtle)

    2. XAxis and YAxis:
       tick={{ fill: '#4A4A4A', fontSize: 11, fontFamily: 'Urbanist' }}
       axisLine={{ stroke: '#1F1F1F' }}
       tickLine={false}

    3. Tooltip:
       contentStyle={{
         background: '#111111',
         border: '1px solid #1F1F1F',
         borderRadius: '8px',
         color: '#FFFFFF',
         fontSize: '12px',
         fontFamily: 'Urbanist',
         padding: '10px 14px',
         boxShadow: 'none'
       }}
       labelStyle={{ color: '#8A8A8A', marginBottom: '6px', fontSize: '11px',
                     textTransform: 'uppercase', letterSpacing: '0.06em' }}
       cursor={{ stroke: '#F26415', strokeWidth: 1, strokeDasharray: '3 3' }}

    4. Legend:
       wrapperStyle={{ fontSize: '11px', color: '#8A8A8A',
                       fontFamily: 'Urbanist', paddingTop: '12px' }}

    5. Line chart lines:
       - Primary data line: stroke="#F26415" strokeWidth={2} dot={false}
       - Secondary/predicted line: stroke="#3E3E3E" strokeWidth={1.5}
         strokeDasharray="4 3" dot={false}

    6. Bar chart bars:
       - Primary bars: fill="#F26415" fillOpacity={0.85} radius={[4,4,0,0]}
       - Secondary bars: fill="#3E3E3E" radius={[4,4,0,0]}

    7. Area fills:
       - fill="url(#areaGradient)" — define linearGradient in <defs>:
         <defs>
           <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
             <stop offset="5%"  stopColor="#F26415" stopOpacity={0.15}/>
             <stop offset="95%" stopColor="#F26415" stopOpacity={0}/>
           </linearGradient>
         </defs>

    8. PieChart / DonutChart:
       Stroke between segments: stroke="#0A0A0A" strokeWidth={2}
       Colors array (replace existing colors):
         ['#F26415', '#3E3E3E', '#1F1F1F', '#D2D2D2']

    9. ResponsiveContainer:
       Always wrap charts: <ResponsiveContainer width="100%" height={height or 260}>

    10. ReferenceLine (peak markers):
        stroke="#F26415" strokeWidth={1} strokeDasharray="3 3"
        label={{ fill: '#F26415', fontSize: 10 }}

    For HeatmapChart specifically:
      Cell colors must transition from #1F1F1F (zero/low) → #F26415 (high)
      Use interpolation: low = '#1A1A1A', mid = '#7A3008', high = '#F26415'
      Cell border: 1px solid #0A0A0A
      Cell border-radius: 3px
  </action>
  <verify>
    CartesianGrid stroke is #1F1F1F in all chart files
    Tooltip contentStyle background is #111111 in all files
    Primary line/bar color is #F26415
    No green (#10B981) or blue (#3B82F6) colors remain as primary chart colors
    Heatmap uses orange gradient scale
  </verify>
  <done>All Recharts charts updated to dark minimal orange-accent theme</done>
</task>

<task type="edit">
  <name>Task 6: Redesign dashboard home page layout and spacing</name>
  <files>frontend/src/app/page.tsx</files>
  <action>
    IMPORTANT: Do not remove any components or change data fetching.
    Only update the wrapper div classNames, section headings, and grid layout.

    Apply these exact changes:

    1. Outermost page wrapper — replace its className with:
       style={{ padding: '28px 28px', minHeight:'100vh',
                background:'var(--bg-base)' }}

    2. Page section headings (e.g. "Summary", "Charts") — replace with:
       <h2 style={{ fontSize:'11px', fontWeight:400, letterSpacing:'0.08em',
                    textTransform:'uppercase', color:'var(--text-tertiary)',
                    marginBottom:'12px', marginTop:'28px' }}>
         {sectionName}
       </h2>

    3. Summary cards grid — replace className with:
       style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))',
                gap:'12px', marginBottom:'24px' }}

    4. Charts section grid — replace className with:
       style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)',
                gap:'12px' }}

    5. Each chart card wrapper — wrap each chart in:
       <div className="card" style={{ gridColumn: 'span 6' }}>
         <div style={{ display:'flex', justifyContent:'space-between',
                       alignItems:'center', marginBottom:'16px' }}>
           <span className="metric-label">{chartTitle}</span>
           <button className="expand-btn">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
               <polyline points="15 3 21 3 21 9"/>
               <line x1="21" y1="3" x2="14" y2="10"/>
             </svg>
           </button>
         </div>
         {/* chart component here */}
       </div>

    6. Quick insights panel — wrap in .card, update each insight item:
       Each insight item: padding 12px 0, border-bottom: 1px solid var(--border-subtle)
       Severity badges:
         critical: background #EF444420, color #EF4444, border-radius 4px, padding 2px 8px, font-size 10px
         high:     background #F2641520, color #F26415, same sizing
         medium:   background #3E3E3E40, color #D2D2D2, same sizing
         low:      background #1F1F1F,   color #4A4A4A, same sizing

    7. Add a subtle divider between the page title and summary cards:
       <div style={{ height:'1px', background:'var(--border)',
                     margin:'16px 0 24px' }}/>

    8. Page title:
       <h1 style={{ fontSize:'28px', fontWeight:600, letterSpacing:'-0.02em',
                    color:'var(--text-primary)', marginBottom:'4px' }}>
         {pageTitle}
       </h1>
       <p style={{ fontSize:'13px', color:'var(--text-secondary)',
                   fontWeight:400 }}>
         {subtitle}
       </p>
  </action>
  <verify>
    Page background is #0A0A0A (var(--bg-base))
    All cards use className="card"
    Summary cards grid uses repeat(auto-fill, minmax(200px, 1fr))
    Section headings use metric-label style (uppercase, 11px, muted)
    Severity badges use correct dark-tinted colors, not solid bright colors
    No bg-[#0F172A] or bg-[#1E293B] hardcoded classes remain
  </verify>
  <done>Dashboard home page layout redesigned to Meevis minimal dark style</done>
</task>

<task type="edit">
  <name>Task 7: Update SolarCard and AQICard to use new design tokens</name>
  <files>
    frontend/src/components/dashboard/SolarCard.jsx,
    frontend/src/components/dashboard/AQICard.jsx
  </files>
  <action>
    IMPORTANT: Keep all existing logic (usePolling, useCountUp, error/loading states).
    Only replace color values and className strings.

    For BOTH files, apply these replacements:

    1. Card container — replace any bg-[#1E293B] or similar with:
       className="card"
       Remove all bg-slate-*, border-slate-* Tailwind classes from the outer div

    2. Skeleton loading divs — replace:
       className="animate-shimmer ..." (keep animate-shimmer, remove color classes)
       Set explicit height and width via style prop if needed

    3. All label text — replace color classes with:
       style={{ color: 'var(--text-secondary)' }}
       Remove text-slate-400, text-slate-500 etc.

    4. Large metric number — add:
       className="metric-value"
       Remove text-2xl, text-white, font-bold classes

    5. The animated progress bar track:
       Replace bg-slate-700 with style={{ background: 'var(--border)' }}
       Replace bg-amber-400 (solar bar fill) with style={{ background: 'var(--accent)' }}
       Replace any AQI level bg colors with the appropriate tinted versions:
         Good (green):     background: '#10B98120'  color: '#10B981'
         Moderate (yellow): background: '#EAB30820' color: '#EAB308'
         Unhealthy:        background: '#F2641520'  color: '#F26415'
         Hazardous:        background: '#EF444420'  color: '#EF4444'

    6. Retry button:
       style={{ color: 'var(--accent)', fontSize:'12px', background:'transparent',
                border:'none', cursor:'pointer', padding:0, textDecoration:'underline' }}

    7. Live indicator dot — keep className="live-indicator" (already defined in globals.css)

    8. Bottom row (cloud%, temp, updated time):
       style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
       Updated time: style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}
  </action>
  <verify>
    SolarCard outer div has className="card"
    No bg-slate-* or border-slate-* classes remain in either file
    Metric value uses metric-value class
    Progress bar track background is var(--border)
    Progress bar fill is var(--accent) for solar card
    Logic and hooks are unchanged
  </verify>
  <done>SolarCard and AQICard updated to new dark token system</done>
</task>

<task type="edit">
  <name>Task 8: Apply dark token system to all remaining page files</name>
  <files>
    frontend/src/app/energy/page.tsx,
    frontend/src/app/waste/page.tsx,
    frontend/src/app/predictions/page.tsx,
    frontend/src/app/recommendations/page.tsx,
    frontend/src/app/reports/page.tsx
  </files>
  <action>
    Apply the SAME changes to ALL 5 files. For each file:

    1. Page wrapper background:
       Replace bg-[#0F172A] or any slate/dark background class with:
       style={{ padding:'28px', minHeight:'100vh', background:'var(--bg-base)' }}

    2. ALL card/panel divs:
       Replace bg-[#1E293B] border-slate-700 or similar with className="card"

    3. ALL headings inside pages:
       Replace text-white or text-slate-* with style={{ color:'var(--text-primary)' }}
       or style={{ color:'var(--text-secondary)' }} as appropriate

    4. ALL form inputs, selects, date pickers:
       style={{
         background: 'var(--bg-card)',
         border: '1px solid var(--border)',
         borderRadius: '8px',
         color: 'var(--text-primary)',
         fontSize: '13px',
         padding: '8px 12px',
         outline: 'none',
         fontFamily: 'Urbanist'
       }}
       On focus: border-color changes to var(--charcoal) — add onFocus/onBlur handlers

    5. ALL buttons (primary action):
       style={{
         background: 'var(--accent)',
         color: '#FFFFFF',
         border: 'none',
         borderRadius: '8px',
         padding: '8px 16px',
         fontSize: '13px',
         fontWeight: 500,
         cursor: 'pointer',
         fontFamily: 'Urbanist',
         transition: 'opacity 0.15s'
       }}
       onMouseEnter: opacity 0.85
       onMouseLeave: opacity 1

    6. ALL buttons (secondary/ghost):
       style={{
         background: 'transparent',
         color: 'var(--text-secondary)',
         border: '1px solid var(--border)',
         borderRadius: '8px',
         padding: '8px 16px',
         fontSize: '13px',
         cursor: 'pointer',
         fontFamily: 'Urbanist'
       }}

    7. ALL table elements (if present):
       table: style={{ width:'100%', borderCollapse:'collapse' }}
       th: style={{ color:'var(--text-tertiary)', fontSize:'11px',
                    letterSpacing:'0.06em', textTransform:'uppercase',
                    padding:'8px 12px', borderBottom:'1px solid var(--border)',
                    fontWeight:400, textAlign:'left' }}
       td: style={{ color:'var(--text-secondary)', fontSize:'13px',
                    padding:'10px 12px', borderBottom:'1px solid var(--border-subtle)' }}
       tr hover: backgroundColor: 'var(--bg-card-hover)' via onMouseEnter/Leave

    8. Priority/status badges in recommendations:
       High:        { background:'#EF444420', color:'#EF4444' }
       Medium:      { background:'#F2641520', color:'#F26415' }
       Low:         { background:'#3E3E3E40', color:'#D2D2D2' }
       Implemented: { background:'#10B98120', color:'#10B981' }
       Badge style: { borderRadius:'4px', padding:'2px 8px', fontSize:'10px',
                      fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }

    Do not change any data fetching, API calls, or chart components in these files.
    Only change the wrapper divs, typography, form elements, buttons, badges, and tables.
  </action>
  <verify>
    All 5 page files have page wrapper with background var(--bg-base)
    No bg-[#0F172A] or bg-[#1E293B] hardcoded hex classes remain
    All cards use className="card"
    Inputs have dark background, border var(--border)
    Primary buttons use var(--accent) background
    Badges use tinted dark background + matching text color
  </verify>
  <done>All 5 remaining pages updated to dark minimal token system</done>
</task>

<task type="shell">
  <name>Task 9: Verify no legacy colors remain</name>
  <files>frontend/src/</files>
  <action>
    Run these grep commands from the frontend/ directory to find any remaining
    legacy colors that must be cleaned up:

    cd frontend/src

    echo "=== Checking for old background colors ==="
    grep -r "bg-\[#0F172A\]\|bg-\[#1E293B\]\|bg-slate-800\|bg-slate-900" \
         --include="*.jsx" --include="*.tsx" -l

    echo "=== Checking for old emerald green ==="
    grep -r "emerald\|#10B981\|text-emerald\|bg-emerald" \
         --include="*.jsx" --include="*.tsx" -l \
         | grep -v "SolarCard\|AQICard"

    echo "=== Checking for old primary blue accent ==="
    grep -r "#3B82F6\|text-blue-\|bg-blue-" \
         --include="*.jsx" --include="*.tsx" -l

    echo "=== Done ==="

    For each file reported: open it and replace the specific legacy class/hex with
    the appropriate new token from this list:
      Old bg-[#0F172A]     → style={{ background:'var(--bg-base)' }}
      Old bg-[#1E293B]     → className="card" or style={{ background:'var(--bg-card)' }}
      Old #10B981 (emerald) → var(--accent) if it's a primary action color,
                              or keep as-is ONLY in AQI "good" status indicators
      Old #3B82F6 (blue)    → var(--accent) if primary action, var(--charcoal) if secondary
  </action>
  <verify>
    grep for bg-[#0F172A] returns 0 files (outside of globals.css)
    grep for bg-[#1E293B] returns 0 files
    All primary action colors use var(--accent) or #F26415
  </verify>
  <done>Legacy color sweep complete</done>
</task>
</tasks>
