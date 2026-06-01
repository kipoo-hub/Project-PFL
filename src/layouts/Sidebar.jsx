import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays,
  BarChart3, Settings, PawPrint, LogOut, ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/',           label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/pasien',     label: 'Pasien',       icon: Users },
  { path: '/jadwal',     label: 'Jadwal Temu',  icon: CalendarDays },
  { path: '/analitik',  label: 'Analitik',     icon: BarChart3 },
  { path: '/pengaturan', label: 'Pengaturan',   icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'var(--bg-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Branding */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b5bdb, #7048e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,91,219,0.4)', flexShrink: 0,
          }}>
            <PawPrint size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1.2 }}>PetCare Clinic</div>
            <div style={{ fontSize: 11, color: 'var(--text-sidebar)', lineHeight: 1.2 }}>Klinik Hewan Terpercaya</div>
          </div>
        </Link>
      </div>

      {/* Label */}
      <div style={{ padding: '20px 20px 8px' }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(160,174,192,0.5)' }}>
          Menu Utama
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            // Active: exact match for "/" and startsWith for others
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link
                  id={`sidebar-nav-${item.path.replace('/', '') || 'dashboard'}`}
                  to={item.path}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: isActive ? 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-sidebar)',
                    fontSize: 14, fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 4px 12px rgba(59,91,219,0.3)' : 'none',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-sidebar)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px 12px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(160,174,192,0.7)', marginBottom: 8 }}>Status Klinik</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ca678', boxShadow: '0 0 6px rgba(12,166,120,0.6)' }} />
            <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>Buka — Hari ini</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(160,174,192,0.6)', marginTop: 4 }}>08:00 – 20:00 WIB</div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, border: 'none',
            background: 'transparent', color: 'var(--text-sidebar)',
            cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,49,49,0.15)'; e.currentTarget.style.color = '#fc8181'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sidebar)'; }}
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
