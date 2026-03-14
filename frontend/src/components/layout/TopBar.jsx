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
        <span className="text-sm text-slate-400 hidden sm:block" suppressHydrationWarning>Today: {new Date().toLocaleDateString()}</span>
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