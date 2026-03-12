import SummaryCard from '@/components/dashboard/SummaryCard';
import EnergyLineChart from '@/components/dashboard/EnergyLineChart';
import BuildingBarChart from '@/components/dashboard/BuildingBarChart';
import WeeklyTrendChart from '@/components/dashboard/WeeklyTrendChart';
import WasteDonutChart from '@/components/dashboard/WasteDonutChart';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import { Zap, Trash2, Globe, DollarSign, Leaf } from 'lucide-react';

export default function Home() {
  const summaryCards = [
    {
      title: 'Total Energy Today',
      value: 2450,
      unit: 'kWh',
      icon: Zap,
      trend: '+12% vs yesterday',
      trendUpIsGood: false,
      color: 'primary',
    },
    {
      title: "Today's Waste",
      value: 340,
      unit: 'kg',
      icon: Trash2,
      trend: '-5% vs last week',
      trendUpIsGood: false,
      color: 'accent',
    },
    {
      title: 'Carbon Footprint',
      value: 2009,
      unit: 'kg CO₂',
      icon: Globe,
      trend: '+2% vs last month',
      trendUpIsGood: false,
      color: 'yellow',
    },
    {
      title: 'Monthly Savings',
      value: 24500,
      unit: '₹',
      icon: DollarSign,
      trend: '+8% vs last month',
      trendUpIsGood: true,
      color: 'green',
    },
    {
      title: 'Sustainability Score',
      value: 73,
      unit: '/100',
      icon: Leaf,
      trend: null,
      trendUpIsGood: true,
      color: 'primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map((card, idx) => (
          <SummaryCard key={idx} {...card} />
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">24-Hour Energy Trend</h2>
          <EnergyLineChart />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Building Energy Comparison</h2>
          <BuildingBarChart />
        </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Weekly Energy Trend with Forecast</h2>
          <WeeklyTrendChart />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Waste Composition</h2>
          <WasteDonutChart />
        </div>
      </div>

      {/* Row 4: Insights */}
      <div className="glass-card p-6">
        <InsightsPanel />
      </div>
    </div>
  );
}
