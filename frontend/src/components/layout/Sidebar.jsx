'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, Trash2, TrendingUp, Lightbulb, FileText, Menu, X, Map } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Energy Analytics', href: '/energy', icon: Zap },
  { name: 'Waste Management', href: '/waste', icon: Trash2 },
  { name: 'AI Predictions', href: '/predictions', icon: TrendingUp },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Campus Map', href: '/campus', icon: Map },
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