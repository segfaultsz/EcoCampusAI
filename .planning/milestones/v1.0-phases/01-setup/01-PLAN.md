---
wave: 1
depends_on: []
files_modified:
  - frontend/package.json
  - frontend/tailwind.config.js
  - frontend/src/styles/globals.css
  - frontend/src/lib/supabase.js
  - frontend/.env.local
  - frontend/src/lib/utils.js
autonomous: true
---

<plan>
<objective>Execute Phase 1: Setup & Foundation — build project scaffolding, design system, and core infrastructure</objective>

<tasks>
  <task id="1">
    <title>Initialize Next.js Project</title>
    <description>Create Next.js 14 app using create-next-app with TypeScript, Tailwind, App Router, src-dir. Then install required dependencies: recharts, @supabase/supabase-js, lucide-react, date-fns, clsx.</description>
    <commands>
      <command>cd e:\\WorkSpace\\Appathon</command>
      <command>npx -y create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm</command>
      <command>cd frontend</command>
      <command>npm install recharts @supabase/supabase-js lucide-react date-fns clsx</command>
    </commands>
  </task>

  <task id="2">
    <title>Configure Tailwind Theme</title>
    <description>Update frontend/tailwind.config.js with EcoCampus design tokens (primary green, accent blue, dark color palette, Inter font, border radius). Set darkMode: 'class' for manual toggle.</description>
    <file_edits>
      <edit path="frontend/tailwind.config.js">/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B' },
        accent: { 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
        dark: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A', 950: '#020617' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '12px', '2xl': '16px' },
    },
  },
  plugins: [],
};</edit>
    </file_edits>
  </task>

  <task id="3">
    <title>Set Up Global Styles</title>
    <description>Update frontend/src/styles/globals.css: import Inter font from Google Fonts, set body background to #0F172A and text to #F1F5F9, add .glass-card utility class with backdrop blur.</description>
    <file_edits>
      <edit path="frontend/src/styles/globals.css">@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #0F172A;
  color: #F1F5F9;
}

.glass-card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
}</edit>
    </file_edits>
  </task>

  <task id="4">
    <title>Create Supabase Client</title>
    <description>Create frontend/src/lib/supabase.ts to export Supabase client. Add validation to ensure URLs and keys are present before creation. Also create frontend/.env.local with placeholder environment variables for Supabase and Python API.</description>
    <file_edits>
      <edit path="frontend/src/lib/supabase.ts">import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');</edit>
      <edit path="frontend/.env.local">NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000</edit>
    </file_edits>
  </task>

  <task id="5">
    <title>Create Utility Helpers</title>
    <description>Create frontend/src/lib/utils.js with formatting utilities: formatNumber, formatKWh, formatCurrency (INR), formatCO2, getTimeAgo, cn (class merger), getSeverityColor.</description>
    <file_edits>
      <edit path="frontend/src/lib/utils.js">export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('en-IN').format(Math.round(num * 10) / 10);
}

export function formatKWh(kwh) {
  return `${formatNumber(kwh)} kWh`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCO2(kg) {
  return `${formatNumber(kg)} kg CO₂`;
}

export function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getSeverityColor(severity) {
  switch (severity) {
    case 'low':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-orange-400';
    case 'critical':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}</edit>
    </file_edits>
  </task>
</tasks>

<verification>
  <must_have id="vh-1">frontend directory exists with package.json</must_have>
  <must_have id="vh-2">tailwind.config.js contains design tokens (primary, accent, dark colors)</must_have>
  <must_have id="vh-3">globals.css imports Inter font and defines .glass-card</must_have>
  <must_have id="vh-4">src/lib/supabase.js exports supabase client</must_have>
  <must_have id="vh-5">.env.local contains Supabase and API URLs</must_have>
  <must_have id="vh-6">src/lib/utils.js exports all helper functions</must_have>
</verification>
</plan>
