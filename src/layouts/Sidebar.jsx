import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays,
  BarChart3, Settings, PawPrint, LogOut
} from 'lucide-react';

// NavItems disesuaikan persis dengan fitur kamu:
// Dashboard, Pasien, Jadwal Temu, Analitik, Pengaturan
const navItems = [
  { path: '/',           label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/pasien',      label: 'Pasien',       icon: Users },
  { path: '/jadwal',      label: 'Jadwal Temu',  icon: CalendarDays },
  { path: '/analitik',    label: 'Analitik',     icon: BarChart3 },
  { path: '/pengaturan',  label: 'Pengaturan',   icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      background: '#ffffff', // Tema putih bersih
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Branding */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#000000', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PawPrint size={18} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1 }}>PetCare Clinic</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Dashboard Analytics</div>
        </div>
      </div>

      {/* Label Menu Utama */}
      <div style={{ padding: '20px 24px 8px' }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>
          Menu Utama
        </span>
      </div>

      {/* Navigasi - Sesuai fitur kamu */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 8,
                    background: isActive ? '#f1f5f9' : 'transparent', 
                    color: isActive ? '#1e293b' : '#64748b',
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Sidebar - Profil & Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: '50%', 
            background: '#e2e8f0', display: 'flex', 
            alignItems: 'center', justifyContent: 'center' 
          }}>
            <Users size={16} color="#64748b" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Dr. Muhammad Taufiq</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Veterinario Principal</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;