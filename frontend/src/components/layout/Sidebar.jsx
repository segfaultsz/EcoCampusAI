'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, Trash2, TrendingUp, Lightbulb, FileText, Map } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={16} /> },
  { label: 'Energy', href: '/energy', icon: <Zap size={16} /> },
  { label: 'Waste', href: '/waste', icon: <Trash2 size={16} /> },
  { label: 'Predictions', href: '/predictions', icon: <TrendingUp size={16} /> },
  { label: 'Recommendations', href: '/recommendations', icon: <Lightbulb size={16} /> },
  { label: 'Campus Map', href: '/campus', icon: <Map size={16} /> },
  { label: 'Reports', href: '/reports', icon: <FileText size={16} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position:'fixed', left:0, top:'52px', bottom:0, width:'200px',
      background:'var(--bg-base)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', padding:'12px 0',
      overflowY:'auto'
    }}>
      <nav style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                height:'40px',
                padding: '0 16px',
                margin: '0 8px',
                borderRadius:'8px',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize:'13px', fontWeight: isActive ? 500 : 400,
                textDecoration:'none', transition:'all 0.15s',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}