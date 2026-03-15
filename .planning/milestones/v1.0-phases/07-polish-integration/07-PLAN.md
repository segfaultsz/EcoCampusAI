---
wave: 1
depends_on: ["06"]
files_modified:
  - frontend/src/lib/api.js
  - frontend/src/app/api/predictions/route.js
  - frontend/src/app/api/simulate/route.js
  - frontend/src/components/layout/Sidebar.jsx
  - frontend/src/app/globals.css
  - frontend/src/app/page.tsx
  - frontend/README.md
autonomous: true
---

<plan>
<objective>Phase 7: Polish & Integration — Connect real APIs, add responsive design, and polish UI</objective>

<tasks>
  <task id="1">
    <title>Setup API Helper Library</title>
    <description>Create `frontend/src/lib/api.js` to manage all external calls to the FastAPI backend and Supabase. We will focus on the FastAPI endpoints for predictions and simulation first.</description>
    <file_edits>
      <edit path="frontend/src/lib/api.js">const API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

export async function fetchPredictions(buildingId) {
  try {
    const res = await fetch(`${API_URL}/predict/energy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building_id: buildingId, days: 7 }),
    });
    if (!res.ok) throw new Error('Failed to fetch predictions');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function simulateScenario(buildingId, scenario) {
  try {
    const res = await fetch(`${API_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building_id: buildingId, ...scenario }),
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Backend returned error');
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Backend unreachable' };
  }
}</edit>
    </file_edits>
  </task>

  <task id="2">
    <title>Enhance Sidebar Responsiveness</title>
    <description>Update the Sidebar component to collapse on mobile screens using a hamburger menu toggle.</description>
    <file_edits>
      <edit path="frontend/src/components/layout/Sidebar.jsx">'use client';
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
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
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
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} aria-current={isActive ? "page" : undefined}>
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600/20 text-primary-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Icon size={20} />
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
}</edit>
    </file_edits>
  </task>

  <task id="3">
    <title>Add Global Animations</title>
    <description>Add fade-in animation to globals.css and apply it.</description>
    <file_edits>
      <edit path="frontend/src/app/globals.css">@tailwind base;
@tailwind components;
@tailwind utilities;

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
}</edit>
    </file_edits>
  </task>

  <task id="4">
    <title>Update Layout Wrapper for Animation and Responsive Margin</title>
    <description>Update the root page.tsx to use the animation class and ensure layout shifts properly around the fixed sidebar on desktop.</description>
    <file_edits>
      <edit path="frontend/src/app/layout.tsx">import './globals.css';
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
    <html lang="en" className="dark">
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
}</edit>
    </file_edits>
  </task>

  <task id="5">
    <title>Create the TopBar Component</title>
    <description>Build the missing TopBar.jsx layout component referenced in layout.tsx.</description>
    <file_edits>
      <edit path="frontend/src/components/layout/TopBar.jsx">'use client';
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
        <span className="text-sm text-slate-400 hidden sm:block">Today: {new Date().toLocaleDateString()}</span>
        <button className="p-2 text-slate-400 hover:text-white transition-colors relative" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}</edit>
    </file_edits>
  </task>
  
  <task id="6">
    <title>Create README.md</title>
    <description>Add a proper README documenting the final application architecture and how to run it.</description>
    <file_edits>
      <edit path="frontend/README.md"># EcoCampus AI 🌍⚡

*Smart insights for a sustainable campus.*

EcoCampus AI is a full-stack dashboard designed to monitor real-time electricity consumption and waste generation, predict peak energy usage, detect anomalies, and suggest actionable optimization strategies.

## Architecture
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Recharts
- **Backend:** Python FastAPI for ML Models (Prophet, Isolation Forest)
- **Database:** Supabase (PostgreSQL)

## Getting Started

### 1. Start the Backend API
Navigate to the `backend` directory, setup the environment, and run the FastAPI server:
```bash
cd backend
cp .env.example .env # and fill in your Supabase details
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```
Server runs at `http://localhost:8000`

### 2. Start the Frontend
Navigate to the `frontend` directory, install dependencies, setup the env, and start the dev server:
```bash
cd frontend
cp .env.local.example .env.local # and fill in the details
npm install
npm run dev
```
Dashboard runs at `http://localhost:3000`

## Features Completed (v1)
- Responsive layout with Sidebar and TopBar navigation.
- Dashboard with high-level summaries and trend charts.
- Detailed Energy Analytics with heatmaps and anomaly tracking.
- Waste Management tracking and diversion goals.
- AI Predictions via simulated Python backend endpoints.
- AI Recommendations with carbon equivalences and PDF report generation.</edit>
    </file_edits>
  </task>
</tasks>

<verification>
  <must_have id="vh-1">The app loads with the new TopBar component in place.</must_have>
  <must_have id="vh-2">The layout is responsive; on mobile, the sidebar hides and a hamburger menu appears.</must_have>
  <must_have id="vh-3">The `animate-fade-in` class is applied to the main content area, creating a smooth transition.</must_have>
  <must_have id="vh-4">The `src/lib/api.js` file correctly exports fetch hooks targeting the FastAPI backend.</must_have>
  <must_have id="vh-5">The `README.md` correctly summarizes the application setup.</must_have>
</verification>
</plan>