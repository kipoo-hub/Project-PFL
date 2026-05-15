import React from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-header)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Search Bar */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Search size={16} style={{
          position: 'absolute',
          left: 12,
          color: 'var(--text-muted)',
        }} />
        <input
          id="header-search-input"
          type="text"
          placeholder="Cari pasien, jadwal..."
          style={{
            paddingLeft: 36,
            paddingRight: 16,
            paddingTop: 8,
            paddingBottom: 8,
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 14,
            color: 'var(--text-primary)',
            background: 'var(--bg-app)',
            width: 280,
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--accent-blue)';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notification Bell */}
        <button
          id="header-notification-btn"
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent-blue-light)';
            e.currentTarget.style.color = 'var(--accent-blue)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-app)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            background: 'var(--accent-red)',
            borderRadius: '50%',
            border: '2px solid white',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: 'var(--border-color)' }} />

        {/* User Profile */}
        <button
          id="header-profile-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-app)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 13,
            flexShrink: 0,
          }}>
            DT
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Dr Taufiq
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Dokter Hewan
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>
      </div>
    </header>
  );
};

export default Header;
