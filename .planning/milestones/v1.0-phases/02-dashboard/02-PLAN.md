---
wave: 1
depends_on: ["01"]
files_modified:
  - frontend/src/components/layout/Sidebar.jsx
  - frontend/src/components/layout/TopBar.jsx
  - frontend/src/components/dashboard/SummaryCard.jsx
  - frontend/src/components/dashboard/EnergyLineChart.jsx
  - frontend/src/components/dashboard/BuildingBarChart.jsx
  - frontend/src/components/dashboard/WeeklyTrendChart.jsx
  - frontend/src/components/dashboard/WasteDonutChart.jsx
  - frontend/src/components/dashboard/InsightsPanel.jsx
  - frontend/src/app/page.js
autonomous: true
---

<plan>
<objective>Phase 2: Dashboard Home — Build all dashboard components and page with mock data</objective>

<tasks>
  <task id="1">
    <title>Build Sidebar Component</title>
    <description>Create frontend/src/components/layout/Sidebar.jsx with collapsible navigation (256px expanded, 72px collapsed), logo, 6 nav links with icons, active state using usePathname, and collapse toggle.</description>
    <file_edits>
      <edit path="frontend/src/components/layout/Sidebar.jsx">'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Zap,
  Trash2,
  Brain,
  Lightbulb,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Energy', href: '/energy', icon: Zap },
  { name: 'Waste', href: '/waste', icon: Trash2 },
  { name: 'Predictions', href: '/predictions', icon: Brain },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-dark-900 border-r border-gray-800 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[256px]'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <span className="text-2xl" title="EcoCampus AI">
            🌱
          </span>
          {!collapsed && (
            <span className="ml-2 text-lg font-semibold text-primary-400">
              EcoCampus AI
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 transition-colors border-l-4 ${
                  isActive
                    ? 'bg-primary-900/30 border-primary-500 text-primary-300'
                    : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}</edit>
    </file_edits>
  </task>

  <task id="2">
    <title>Build TopBar Component</title>
    <description>Create frontend/src/components/layout/TopBar.jsx with page title, building selector dropdown, current date, notification bell with badge, and dark/light mode toggle. Sticky top with blur background.</description>
    <file_edits>
      <edit path="frontend/src/components/layout/TopBar.jsx">'use client';
import { Bell, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

const buildings = [
  { code: 'CSE', name: 'Computer Science Block' },
  { code: 'ECE', name: 'Electronics Block' },
  { code: 'LIB', name: 'Central Library' },
  { code: 'ADM', name: 'Admin Building' },
  { code: 'MEC', name: 'Mechanical Workshop' },
  { code: 'HOS1', name: 'Boys Hostel A' },
  { code: 'HOS2', name: 'Girls Hostel B' },
  { code: 'CAF', name: 'Cafeteria Complex' },
  { code: 'SPT', name: 'Sports Complex' },
  { code: 'SCI', name: 'Science Block' },
];

export default function TopBar({ title }) {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState('All');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-dark-900/80 px-6 backdrop-blur-md">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-white">{title}</h1>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* Building Selector */}
        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="All">All Buildings</option>
          {buildings.map((b) => (
            <option key={b.code} value={b.code}>
              {b.code} — {b.name}
            </option>
          ))}
        </select>

        {/* Date Display */}
        <span className="text-sm text-gray-400">{today}</span>

        {/* Notification Bell */}
        <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}</edit>
    </file_edits>
  </task>

  <task id="3">
    <title>Create Layout Wrapper</title>
    <description>Update frontend/src/app/layout.js to wrap children with Sidebar and TopBar. Adjust main content margin to account for fixed sidebar. Import TopBar with dynamic title? Actually pass title from children via context or just hardcode "Dashboard" for now. Simpler: layout receives title prop? Not directly. We'll set TopBar title via page metadata or just a default. Let's use a simple approach: in layout, set a placeholder; TopBar gets title from its prop, but layout should pass page title. For now, we can read from children? Simpler: make TopBar accept a 'title' prop, and in layout, we can't pass it directly. Better: use page's metadata. However to keep simple, in layout we can set TopBar with static "Dashboard" and later pages will have their own TopBar in each page. Actually design: layout wraps all pages with Sidebar and a TopBar that shows page-specific title. We can use usePathname to derive title. That's cleaner. Update TopBar to compute title from pathname automatically. Alternatively, each page renders its own TopBar inside main content. But spec says TopBar in root. Let's adjust: TopBar will accept a 'title' prop; layout can derive from pathname: switch (pathname) { case '/': return 'Dashboard'; case '/energy': return 'Energy Analytics'; ...}. We'll do that. Update TopBar to not take title prop but compute internally? Simpler: pass title prop from layout. I'll create a mapping in layout.</description>
    <file_edits>
      <edit path="frontend/src/app/layout.tsx">import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "EcoCampus AI",
  description: "Campus sustainability dashboard",
};

const pageTitles = {
  '/': 'Dashboard',
  '/energy': 'Energy Analytics',
  '/waste': 'Waste Management',
  '/predictions': 'AI Predictions',
  '/recommendations': 'Recommendations',
  '/reports': 'Reports',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto bg-[#0F172A]">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}</edit>
    </file_edits>
  </task>

  <task id="4">
    <title>Build SummaryCard Component</title>
    <description>Create frontend/src/components/dashboard/SummaryCard.jsx with glass-card styling, large animated value, trend arrow (up/down), and icon. Include count-up animation using useEffect and requestAnimationFrame.</description>
    <file_edits>
      <edit path="frontend/src/components/dashboard/SummaryCard.jsx">'use client';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function SummaryCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendUpIsGood = true,
  color = 'primary',
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = useRef(value);

  useEffect(() => {
    targetValue.current = value;
    setDisplayValue(0);
    let start = null;
    const duration = 1000;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(progress * targetValue.current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  }, [value]);

  const trendColor =
    trendUpIsGood === (trend?.[0] === '+')
      ? 'text-green-400'
      : 'text-red-400';
  const trendArrow = trend?.startsWith('+') ? '↑' : '↓';

  // Color mapping for icon background
  const colorClasses = {
    primary: 'bg-primary-500/20 text-primary-400',
    accent: 'bg-accent-500/20 text-accent-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`rounded-full p-3 ${colorClasses[color] || colorClasses.primary}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold">
              {typeof displayValue === 'number'
                ? displayValue.toLocaleString('en-IN', {
                    maximumFractionDigits: 1,
                  })
                : displayValue}{' '}
              {unit}
            </p>
          </div>
        </div>
        {trend && (
          <span className={cn('text-sm font-medium', trendColor)}>
            {trendArrow} {trend.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}</edit>
    </file_edits>
  </task>

  <task id="5">
    <title>Build Dashboard Home Page</title>
    <description>Create frontend/src/components/dashboard/* chart components and the page.js homepage assembling everything with mock data. Use Recharts for EnergyLineChart, BuildingBarChart, WeeklyTrendChart, WasteDonutChart. Add InsightsPanel with 3 static cards. Ensure responsive grid layout.</description>
    <file_edits>
      <edit path="frontend/src/components/dashboard/EnergyLineChart.jsx">'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  consumption: 150 + (i > 9 && i < 16 ? 100 : 0) + (i % 3) * 10,
  predicted: 140 + (i > 9 && i < 16 ? 80 : 0) + (i % 4) * 8,
}));

export default function EnergyLineChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={mockData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="hour" stroke="#94a3b8" tickFormatter={(h) => `${h}:00`} />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Line
          type="monotone"
          dataKey="consumption"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="Actual"
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Predicted"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}</edit>
      <edit path="frontend/src/components/dashboard/BuildingBarChart.jsx">'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const buildings = [
  { name: 'CSE', energy: 320 },
  { name: 'ECE', energy: 280 },
  { name: 'LIB', energy: 360 },
  { name: 'ADM', energy: 170 },
  { name: 'MEC', energy: 450 },
  { name: 'HOS1', energy: 240 },
  { name: 'HOS2', energy: 220 },
  { name: 'CAF', energy: 200 },
  { name: 'SPT', energy: 100 },
  { name: 'SCI', energy: 300 },
];

export default function BuildingBarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={buildings} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal />
        <XAxis type="number" stroke="#94a3b8" />
        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={40} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Bar dataKey="energy" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}</edit>
      <edit path="frontend/src/components/dashboard/WeeklyTrendChart.jsx">'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { day: 'Mon', actual: 2400, forecast: 2500 },
  { day: 'Tue', actual: 2600, forecast: 2550 },
  { day: 'Wed', actual: 2500, forecast: 2600 },
  { day: 'Thu', actual: 2700, forecast: 2650 },
  { day: 'Fri', actual: 2800, forecast: 2700 },
  { day: 'Sat', actual: 1200, forecast: 1300 },
  { day: 'Sun', actual: 1000, forecast: 1100 },
];

export default function WeeklyTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="actual"
          stackId="1"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.6}
          name="Actual"
        />
        <Area
          type="monotone"
          dataKey="forecast"
          stackId="2"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
          name="Forecast"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}</edit>
      <edit path="frontend/src/components/dashboard/WasteDonutChart.jsx">'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Organic', value: 120 },
  { name: 'Recyclable', value: 80 },
  { name: 'E-Waste', value: 30 },
  { name: 'General', value: 110 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#64748b'];

export default function WasteDonutChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}</edit>
      <edit path="frontend/src/components/dashboard/InsightsPanel.jsx">'use client';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const insights = [
  {
    id: 1,
    title: 'Library AC ran 3 hours past closing',
    severity: 'high',
    message: 'Energy consumption remained elevated until 1 AM.',
  },
  {
    id: 2,
    title: 'CSE building within 10% of peak',
    severity: 'medium',
    message: 'Current usage trending toward afternoon peak.',
  },
  {
    id: 3,
    title: 'Waste diversion rate improved',
    severity: 'low',
    message: 'Recycling increased 5% this week.',
  },
];

export default function InsightsPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Insights</h2>
      {insights.map((insight) => (
        <div key={insight.id} className="glass-card p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-primary-400" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{insight.title}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    insight.severity === 'high' &&
                      'bg-red-500/20 text-red-400',
                    insight.severity === 'medium' &&
                      'bg-yellow-500/20 text-yellow-400',
                    insight.severity === 'low' &&
                      'bg-green-500/20 text-green-400'
                  )}
                >
                  {insight.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">{insight.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}</edit>
      <edit path="frontend/src/app/page.js">import SummaryCard from '@/components/dashboard/SummaryCard';
import EnergyLineChart from '@/components/dashboard/EnergyLineChart';
import BuildingBarChart from '@/components/dashboard/BuildingBarChart';
import WeeklyTrendChart from '@/components/dashboard/WeeklyTrendChart';
import WasteDonutChart from '@/components/dashboard/WasteDonutChart';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import {
  Zap,
  Trash2,
  Globe,
  DollarSign,
  Leaf,
} from 'lucide-react';

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
}</edit>
    </file_edits>
  </task>
</tasks>

<verification>
  <must_have id="vh-1">Sidebar component exists with navigation links and collapse functionality</must_have>
  <must_have id="vh-2">TopBar component exists with building selector, date, theme toggle</must_have>
  <must_have id="vh-3">Root layout wraps children with Sidebar and TopBar with proper margins</must_have>
  <must_have id="vh-4">SummaryCard component with count-up animation and trend display</must_have>
  <must_have id="vh-5">All 4 chart components (EnergyLineChart, BuildingBarChart, WeeklyTrendChart, WasteDonutChart) render without errors</must_have>
  <must_have id="vh-6">Home page displays all summary cards, charts, and insights panel in responsive grid</must_have>
  <must_have id="vh-7">All components use mock data with realistic numbers</must_have>
  <must_have id="vh-8">All styling uses glass-card and design tokens (primary, accent colors)</must_have>
</verification>
</plan>
