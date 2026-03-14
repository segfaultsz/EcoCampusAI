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
      trendUpIsGood: false,
      color: 'primary',
    },
    {
      title: "Today's Waste",
      value: 340,
      unit: 'kg',
      icon: <Trash2 className="h-6 w-6" />,
      trend: '-5% vs last week',
      trendUpIsGood: false,
      color: 'accent',
    },
    {
      title: 'Carbon Footprint',
      value: 2009,
      unit: 'kg CO₂',
      icon: <Globe className="h-6 w-6" />,
      trend: '+2% vs last month',
      trendUpIsGood: false,
      color: 'yellow',
    },
    {
      title: 'Monthly Savings',
      value: 24500,
      unit: '₹',
      icon: <DollarSign className="h-6 w-6" />,
      trend: '+8% vs last month',
      trendUpIsGood: true,
      color: 'green',
    },
    {
      title: 'Sustainability Score',
      value: 73,
      unit: '/100',
      icon: <Leaf className="h-6 w-6" />,
      trend: null,
      trendUpIsGood: true,
      color: 'primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map((card, idx) => (
          <SummaryCard key={idx} {...card} />
        ))}
        <SolarCard />
        <AQICard />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">24-Hour Energy Trend</h2>
          <EnergyLineChart buildingCode="ALL" />
        </div>
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Building Energy Comparison</h2>
          <BuildingBarChart />
        </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Weekly Energy Trend with Forecast</h2>
          <WeeklyTrendChart />
        </div>
        <div className="dashboard-card p-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Waste Composition</h2>
          <WasteDonutChart />
        </div>
      </div>

      {/* Row 4: Insights */}
      <div className="dashboard-card p-8">
        <InsightsPanel />
      </div>
    </div>
  );
}
