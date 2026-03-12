'use client';
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
}
