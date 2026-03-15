import SummaryCard from '@/components/dashboard/SummaryCard';
import EnergyLineChart from '@/components/dashboard/EnergyLineChart';
import BuildingBarChart from '@/components/dashboard/BuildingBarChart';
import WeeklyTrendChart from '@/components/dashboard/WeeklyTrendChart';
import WasteDonutChart from '@/components/dashboard/WasteDonutChart';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import SolarCard from '@/components/dashboard/SolarCard';
import AQICard from '@/components/dashboard/AQICard';
import { Zap, Trash2, Globe, DollarSign, Leaf } from 'lucide-react';

export default function Home() {
  const summaryCards = [
    {
      title: 'Total Energy Today',
      value: 2450,
      unit: 'kWh',
      icon: <Zap className="h-6 w-6" />,
      trend: '+12% vs yesterday',
      trendDir: 'down', // meaning it went up but maybe bad for energy? The prompt says trendDir 'up' or 'down'
      color: 'primary',
    },
    {
      title: "Today's Waste",
      value: 340,
      unit: 'kg',
      icon: <Trash2 className="h-6 w-6" />,
      trend: '-5% vs last week',
      trendDir: 'up', // down waste is good
      color: 'accent',
    },
    {
      title: 'Carbon Footprint',
      value: 2009,
      unit: 'kg CO₂',
      icon: <Globe className="h-6 w-6" />,
      trend: '+2% vs last month',
      trendDir: 'down',
      color: 'yellow',
    },
    {
      title: 'Monthly Savings',
      value: 24500,
      unit: '₹',
      icon: <DollarSign className="h-6 w-6" />,
      trend: '+8% vs last month',
      trendDir: 'up',
      color: 'green',
    },
    {
      title: 'Sustainability Score',
      value: 73,
      unit: '/100',
      icon: <Leaf className="h-6 w-6" />,
      trend: null,
      trendDir: 'up',
      color: 'primary',
    },
  ];

  return (
    <div style={{ padding: '28px 28px', minHeight:'100vh', background:'var(--bg-base)' }}>
      <h1 style={{ fontSize:'28px', fontWeight:600, letterSpacing:'-0.02em',
                   color:'var(--text-primary)', marginBottom:'4px' }}>
        Dashboard Overview
      </h1>
      <p style={{ fontSize:'13px', color:'var(--text-secondary)',
                  fontWeight:400 }}>
        Track your campus sustainability metrics.
      </p>

      <div style={{ height:'1px', background:'var(--border)', margin:'16px 0 24px' }}/>

      <h2 style={{ fontSize:'11px', fontWeight:400, letterSpacing:'0.08em',
                   textTransform:'uppercase', color:'var(--text-tertiary)',
                   marginBottom:'12px', marginTop:'28px' }}>
        Summary
      </h2>

      {/* Row 1: Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'12px', marginBottom:'24px' }}>
        {summaryCards.map((card, idx) => (
          <SummaryCard key={idx} {...card} />
        ))}
        <SolarCard />
        <AQICard />
      </div>

      <h2 style={{ fontSize:'11px', fontWeight:400, letterSpacing:'0.08em',
                   textTransform:'uppercase', color:'var(--text-tertiary)',
                   marginBottom:'12px', marginTop:'28px' }}>
        Charts
      </h2>

      {/* Row 2: Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:'12px', marginBottom:'12px' }}>
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <span className="metric-label">24-Hour Energy Trend</span>
            <button className="expand-btn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
              </svg>
            </button>
          </div>
          <EnergyLineChart buildingCode="ALL" />
        </div>
        
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <span className="metric-label">Building Energy Comparison</span>
            <button className="expand-btn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
              </svg>
            </button>
          </div>
          <BuildingBarChart />
        </div>
      </div>

      {/* Row 3: Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:'12px', marginBottom:'12px' }}>
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <span className="metric-label">Weekly Energy Trend with Forecast</span>
            <button className="expand-btn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
              </svg>
            </button>
          </div>
          <WeeklyTrendChart />
        </div>
        
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <span className="metric-label">Waste Composition</span>
            <button className="expand-btn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
              </svg>
            </button>
          </div>
          <WasteDonutChart />
        </div>
      </div>

      <h2 style={{ fontSize:'11px', fontWeight:400, letterSpacing:'0.08em',
                   textTransform:'uppercase', color:'var(--text-tertiary)',
                   marginBottom:'12px', marginTop:'28px' }}>
        Monitoring
      </h2>

      {/* Row 4: Insights */}
      <div className="card">
        <InsightsPanel />
      </div>
    </div>
  );
}
