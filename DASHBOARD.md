# EcoCampus AI - Dashboard UI/UX Code

This document contains the complete UI/UX frontend code for the EcoCampus AI Dashboard. It includes the layout components, dashboard charts, CSS, and Tailwind configuration.

## 1. Application Layout & Pages

### `frontend/src/app/layout.tsx`
```tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EcoCampus AI',
  description: 'Smart insights for a sustainable campus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-900">
          <Sidebar />
          <div className="flex-1 md:ml-64 flex flex-col transition-all duration-300">
            <TopBar />
            <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### `frontend/src/app/page.tsx`
```tsx
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
```

## 2. Global Styling & Tailwind Config

### `frontend/src/app/globals.css`
```css
@import "tailwindcss";
@config "../../tailwind.config.ts";

@layer utilities {
  .glass-card {
    @apply bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out forwards;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

body {
  color: #f8fafc;
  background-color: #0f172a;
}
```

### `frontend/tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        accent: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        dark: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
export default config;
```

## 3. Layout Components

### `frontend/src/components/layout/Sidebar.tsx`
```jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, Trash2, TrendingUp, Lightbulb, FileText, Menu, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Energy Analytics', href: '/energy', icon: Zap },
  { name: 'Waste Management', href: '/waste', icon: Trash2 },
  { name: 'AI Predictions', href: '/predictions', icon: TrendingUp },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} suppressHydrationWarning /> : <Menu size={24} suppressHydrationWarning />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <span className="text-xl font-bold text-primary-400">EcoCampus AI</span>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600/20 text-primary-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Icon size={20} suppressHydrationWarning />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
```

### `frontend/src/components/layout/TopBar.tsx`
```jsx
'use client';
import { Bell, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function TopBar() {
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
      {/* Spacer for mobile hamburger menu */}
      <div className="w-10 md:hidden"></div>
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold hidden sm:block">Campus Overview</h1>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-400 hidden sm:block" suppressHydrationWarning>Today: {new Date().toISOString().split('T')[0]}</span>
        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
          <Bell size={20} suppressHydrationWarning />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isDark ? <Sun size={20} suppressHydrationWarning /> : <Moon size={20} suppressHydrationWarning />}
        </button>
      </div>
    </header>
  );
}
```

## 4. Dashboard Components

### `frontend/src/components/dashboard/SummaryCard.tsx`
```jsx
'use client';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function SummaryCard({
  title,
  value,
  unit,
  icon,
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
    trendUpIsGood ^ (trend?.startsWith('+'))
      ? 'text-green-400'
      : 'text-red-400';
  const trendArrow = trend?.startsWith('+') ? '↑' : '↓';

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
            {icon}
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
}
```

### `frontend/src/components/dashboard/EnergyLineChart.tsx`
```jsx
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  consumption: Math.floor(Math.random() * 200) + 100 + (i > 9 && i < 16 ? 100 : 0),
  predicted: Math.floor(Math.random() * 180) + 120 + (i > 9 && i < 16 ? 80 : 0),
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
}
```

### `frontend/src/components/dashboard/BuildingBarChart.tsx`
```jsx
'use client';
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
}
```

### `frontend/src/components/dashboard/WeeklyTrendChart.tsx`
```jsx
'use client';
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
}
```

### `frontend/src/components/dashboard/WasteDonutChart.tsx`
```jsx
'use client';
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
}
```

### `frontend/src/components/dashboard/InsightsPanel.tsx`
```jsx
'use client';
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
}
```