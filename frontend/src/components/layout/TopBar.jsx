'use client';
import { useState } from 'react';

export default function TopBar() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '52px',
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        gap: '16px'
      }}>

        {/* LEFT — Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:'180px' }}>
          <span style={{ fontSize:'13px', fontWeight:600, color:'var(--text-primary)',
                         letterSpacing:'0.04em' }}>
            ecocampus
          </span>
          <span style={{ fontSize:'11px', color:'var(--text-secondary)',
                         fontWeight:400 }}>
            NIST, Palur Hills
          </span>
        </div>

        {/* CENTER — Pill tab switcher */}
        <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
          <nav className="pill-tab-bar">
            {['overview','analytics','monitoring'].map(tab => (
              <button
                key={tab}
                className={`pill-tab${activeTab===tab?' active':''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* RIGHT — Icon buttons */}
        <div style={{ display:'flex', gap:'8px', minWidth:'180px', justifyContent:'flex-end' }}>
          {/* Settings */}
          <button style={{
            width:'32px', height:'32px', display:'flex', alignItems:'center',
            justifyContent:'center', background:'var(--bg-card)',
            border:'1px solid var(--border)', borderRadius:'8px',
            color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--charcoal)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
          </button>
          {/* Refresh / logout */}
          <button style={{
            width:'32px', height:'32px', display:'flex', alignItems:'center',
            justifyContent:'center', background:'var(--bg-card)',
            border:'1px solid var(--border)', borderRadius:'8px',
            color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--charcoal)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.5">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>

      </header>
    </>
  );
}