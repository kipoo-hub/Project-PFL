import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useMemberAuth } from '../context/MemberAuthContext';
import { crmState } from '../lib/crmState';
import '../pages/member/member-dashboard.css';

const NAV_ITEMS_TEMPLATE = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', path: '/member/dashboard' },
  { id: 'pets', icon: '🐾', label: 'Hewan Peliharaan', path: '/member/hewan' },
  { id: 'appointments', icon: '📅', label: 'Janji Temu', path: '/member/janji' },
  { id: 'vaccines', icon: '💉', label: 'Jadwal Vaksinasi', path: '/member/vaksin' },
  { id: 'records', icon: '📋', label: 'Rekam Medis', path: '/member/rekam-medis' },
  { id: 'chat', icon: '💬', label: 'Chat Dokter', path: '/member/chat' },
  { id: 'tiket', icon: '🎫', label: 'Tiket Keluhan', path: '/member/tiket' },
  { id: 'antrian', icon: '🔢', label: 'Antrian', path: '/member/antrian' },
  { id: 'billing', icon: '🧾', label: 'Riwayat Tagihan', path: '/member/tagihan' },
  { id: 'profile', icon: '👤', label: 'Profil Saya', path: '/member/profil' },
];

const BOTTOM_NAV = ['dashboard', 'pets', 'antrian', 'tiket', 'profile'];

const LogoSVG = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <circle cx="20" cy="20" r="20" fill="url(#mdLogoGrad)" />
    <path d="M12 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M20 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M10 24c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6v2H10v-2z" fill="white"/>
    <circle cx="15.5" cy="21" r="1.2" fill="#16a34a" />
    <circle cx="20" cy="21" r="1.2" fill="#16a34a" />
    <circle cx="24.5" cy="21" r="1.2" fill="#16a34a" />
    <defs>
      <linearGradient id="mdLogoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
  </svg>
);

export default function MemberLayout() {
  const { member, logout } = useMemberAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [apptsCount, setApptsCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [ticketsCount, setTicketsCount] = useState(0);

  const loadCounts = () => {
    crmState.init();
    const vacList = crmState.getVaccines();
    setVaccines(vacList);

    const email = member?.email || 'demo@email.com';
    
    // Appointments
    const appts = crmState.getMemberAppointments(email);
    const pendingAppts = appts.filter(a => a.status === 'Menunggu' || a.status === 'Dikonfirmasi').length;
    setApptsCount(pendingAppts);

    // Chats
    const mChats = crmState.getMemberChats(email);
    const totalUnread = mChats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    setChatsCount(totalUnread);

    // Tickets
    const tList = crmState.getTickets();
    const myEmail = email === 'demo@email.com' ? 'budi@email.com' : email;
    const activeTickets = tList.filter(t => t.email === myEmail && (t.status === 'Baru' || t.status === 'Dalam Proses')).length;
    setTicketsCount(activeTickets);
  };

  useEffect(() => {
    loadCounts();

    const handleUpdate = () => {
      loadCounts();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('crm_change', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('crm_change', handleUpdate);
    };
  }, [member]);

  const memberVaccines = vaccines.filter(v => 
    (member?.email && v.email?.toLowerCase() === member.email.toLowerCase()) ||
    (member?.name && v.ownerName?.toLowerCase() === member.name.toLowerCase()) ||
    (member?.email === 'demo@email.com' && v.email === 'budi@email.com')
  );

  const dueVaccines = memberVaccines.filter(v => v.daysRemaining <= 7 && v.status === 'Belum Diingatkan');

  const firstName = member?.name?.split(' ')[0] || 'Member';
  const initials = member?.name
    ? member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'M';

  const handleLogout = () => {
    logout();
    navigate('/guest', { replace: true });
  };

  const isItemActive = (item) => {
    if (item.id === 'dashboard') {
      return location.pathname === '/member/dashboard';
    }
    return location.pathname.startsWith(item.path) && item.id !== 'dashboard' && item.path !== '/member/dashboard';
  };

  const navItems = NAV_ITEMS_TEMPLATE.map(item => {
    let badge = null;
    if (item.id === 'vaccines') badge = dueVaccines.length > 0 ? dueVaccines.length : null;
    if (item.id === 'appointments') badge = apptsCount > 0 ? apptsCount : null;
    if (item.id === 'chat') badge = chatsCount > 0 ? chatsCount : null;
    if (item.id === 'tiket') badge = ticketsCount > 0 ? ticketsCount : null;
    return { ...item, badge };
  });

  return (
    <div className="md-root">
      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div className="md-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`md-sidebar ${sidebarOpen ? 'md-sidebar--open' : ''}`} aria-label="Navigasi member">
        {/* Logo + Member Card */}
        <div className="md-sidebar__header">
          <div className="md-sidebar__logo">
            <LogoSVG />
            <span className="md-sidebar__logo-text">Veterinario</span>
          </div>
          <div className="md-sidebar__member-card">
            <div className="md-sidebar__avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="md-sidebar__member-name">{member?.name}</div>
              <div className="md-sidebar__member-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Member Aktif
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="md-sidebar__nav" aria-label="Menu member">
          <div className="md-sidebar__section-label">Menu Utama</div>
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.id}
                to={item.path}
                id={`sidebar-nav-${item.id}`}
                className={`md-sidebar__item ${active ? 'md-sidebar__item--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              >
                <span className="md-sidebar__item-icon" aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="md-sidebar__item-badge" aria-label={`${item.badge} notifikasi`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="md-sidebar__footer">
          <button id="member-logout-btn" className="md-sidebar__logout" onClick={handleLogout}>
            <span style={{ fontSize: '1.1rem' }} aria-hidden="true">🚪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="md-main">
        {/* Top bar */}
        <header className="md-topbar">
          <div className="md-topbar__left">
            <button
              className="md-topbar__hamburger"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Buka menu"
              aria-expanded={sidebarOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="md-topbar__greeting">
              Halo, <strong>{firstName}!</strong> 👋
            </span>
          </div>

          <div className="md-topbar__right" style={{ position: 'relative' }}>
            <button 
              className="md-topbar__icon-btn" 
              aria-label="Notifikasi"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {dueVaccines.length > 0 && (
                <span className="md-notif-dot" aria-label={`${dueVaccines.length} notifikasi baru`} />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifDropdownOpen && (
              <div className="md-notif-dropdown">
                <div className="md-notif-dropdown__title">
                  <span>Notifikasi Vaksin</span>
                  <button 
                    style={{ border: 'none', background: 'none', fontSize: 11, color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => setNotifDropdownOpen(false)}
                  >
                    Tutup
                  </button>
                </div>
                <div className="md-notif-dropdown__list">
                  {dueVaccines.length === 0 ? (
                    <div style={{ padding: 12, textAlign: 'center', color: 'var(--md-gray-400)', fontSize: '0.8rem' }}>
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    dueVaccines.map(v => (
                      <div key={v.id} className="md-notif-dropdown__item">
                        <div style={{ fontSize: '1.2rem' }}>💉</div>
                        <div>
                          <div className="md-notif-dropdown__item-title">Reminder Vaksinasi</div>
                          <div className="md-notif-dropdown__item-desc">
                            Vaksin <strong>{v.vaccineType}</strong> untuk <strong>{v.petName}</strong> jatuh tempo pada <strong>{v.dueDate}</strong> ({v.daysRemaining <= 0 ? 'Terlambat' : `${v.daysRemaining} hari lagi`}).
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="md-topbar__avatar" role="img" aria-label={`Avatar ${member?.name}`}>{initials}</div>
          </div>
        </header>

        {/* Content */}
        <main className="md-content">
          {/* Warning Banner */}
          {dueVaccines.length > 0 && (
            <div className="md-alert-banner" style={{ marginBottom: 24 }}>
              <div className="md-alert-banner__icon">⚠️</div>
              <div className="md-alert-banner__content">
                <div className="md-alert-banner__title">Peringatan: Jadwal Vaksinasi Jatuh Tempo!</div>
                <div className="md-alert-banner__desc">
                  {dueVaccines.map((v, i) => (
                    <span key={v.id}>
                      Vaksin <strong>{v.vaccineType}</strong> untuk <strong>{v.petName}</strong> akan jatuh tempo pada <strong>{v.dueDate}</strong> ({v.daysRemaining <= 0 ? 'Terlambat!' : `${v.daysRemaining} hari lagi`}).
                      {i < dueVaccines.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
              <button className="md-alert-banner__cta" onClick={() => navigate('/member/janji')}>
                Buat Janji Temu
              </button>
            </div>
          )}

          {/* Child Routes Output */}
          <Outlet />
        </main>
      </div>

      {/* ── BOTTOM NAVIGATION (mobile) ── */}
      <nav className="md-bottom-nav" aria-label="Navigasi mobile">
        <div className="md-bottom-nav__inner">
          {navItems.filter((i) => BOTTOM_NAV.includes(i.id)).map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.id}
                to={item.path}
                id={`bottom-nav-${item.id}`}
                className={`md-bottom-nav__item ${active ? 'md-bottom-nav__item--active' : ''}`}
                aria-label={item.label}
                style={{ textDecoration: 'none' }}
              >
                <span className="md-bottom-nav__item-icon" aria-hidden="true">{item.icon}</span>
                <span className="md-bottom-nav__item-label">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
