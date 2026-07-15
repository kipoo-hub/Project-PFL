import React, { useState } from 'react';
import {
  Bell, Search, ChevronDown,
  LayoutDashboard, Users, CalendarDays
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemberAuth } from '../context/MemberAuthContext';

/* ─── Nav data — hanya fitur yang dipertahankan ──────────────── */
const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    links: [
      { label: 'Overview',        description: 'Ringkasan klinik hari ini', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Pasien',          description: 'Daftar pasien & rekam medis', path: '/pasien',   icon: Users        },
      { label: 'Jadwal Temu',     description: 'Atur appointment & jadwal dokter', path: '/jadwal', icon: CalendarDays },
      { label: 'Kelola Member',   description: 'Data member terdaftar',     path: '/admin/members', icon: Users },
    ],
  },
];


/* ─── Main Header ───────────────────────────────────────────── */
const Header = ({ toggleSidebar, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { member } = useMemberAuth();
  const [notifCount] = useState(3);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const user = member || { name: 'Admin', role: 'Administrator' };

  /* Check if any link in a group is active */
  const isGroupActive = (links) =>
    links.some(
      (l) => location.pathname === l.path || location.pathname.startsWith(l.path + '/')
    );

  const handleHamburgerClick = () => {
    if (window.innerWidth < 768) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex h-13 items-center gap-3 px-4">

        {/* Left: Toggle + Divider + Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            id="header-sidebar-trigger"
            onClick={handleHamburgerClick}
            className="shrink-0 p-1.5 text-slate-500 hover:text-[#4FD1C5] hover:bg-[#F8F9FA] rounded-lg transition-colors duration-150 cursor-pointer outline-none"
            aria-label="Toggle Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="w-px h-4 bg-slate-200 shrink-0 mx-1" />

          {/* Search */}
          <div className="relative max-w-[260px] w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] pointer-events-none"
            />
            <input
              id="header-search-input"
              type="search"
              placeholder="Cari pasien, jadwal…"
              className="pl-9 pr-3 h-8 w-full text-[13px] bg-[#EDF2F7] border-0 placeholder:text-[#A0AEC0] focus:bg-white focus:outline-none rounded-full transition-all duration-150"
            />
          </div>
        </div>

        {/* Right: Notif + Divider + User */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Notification */}
          <div className="relative">
            <button
              id="header-notification-btn"
              aria-label="Notifikasi"
              className="size-8 text-slate-500 hover:text-[#4FD1C5] hover:bg-[#F8F9FA] rounded-lg relative flex items-center justify-center cursor-pointer outline-none"
            >
              <Bell size={16} strokeWidth={1.8} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 text-[8.5px] font-bold bg-[#4FD1C5] text-white rounded-full flex items-center justify-center pointer-events-none">
                  {notifCount}
                </span>
              )}
            </button>
          </div>

          <div className="w-px h-4 bg-slate-200 shrink-0 mx-1" />

          {/* User profile */}
          <button
            id="header-profile-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-2 h-8 hover:bg-[#F8F9FA] rounded-lg transition-colors duration-150 cursor-pointer outline-none"
          >
            {/* Avatar */}
            <div className="size-7 rounded-full bg-gradient-to-br from-[#4FD1C5] to-[#319795] flex items-center justify-center text-white font-bold text-[10px] shrink-0 ring-2 ring-white shadow-sm">
              {(user.name || '').slice(0, 2).toUpperCase()}
            </div>
            {/* Name + role */}
            <div className="hidden sm:flex flex-col text-left leading-none gap-0.5">
              <span className="text-[12.5px] font-bold text-[#2D3748] leading-none">{user.name || 'Admin'}</span>
              <span className="text-[10.5px] text-[#A0AEC0] leading-none">Administrator</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </button>

        </div>
      </div>

      {/* ── Navigation bar ──────────────────────────────────── */}
      <div className="px-3 pb-0 flex items-center border-t border-slate-100 relative">
        <div className="flex gap-1">
          {navItems.map((group) => {
            const active = isGroupActive(group.links);
            const isOpen = activeDropdown === group.label;
            return (
              <div 
                key={group.label} 
                className="relative"
                onMouseEnter={() => setActiveDropdown(group.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : group.label)}
                  className={[
                    'h-9 px-3 text-[12.5px] font-medium border-b-2 transition-all duration-150 flex items-center gap-1 cursor-pointer outline-none',
                    active
                      ? 'border-b-[#4FD1C5] text-[#4FD1C5] font-semibold'
                      : 'border-b-transparent text-slate-500 hover:text-[#4FD1C5]',
                  ].join(' ')}
                >
                  {group.label}
                  <ChevronDown size={12} className={['transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(' ')} />
                </button>

                {isOpen && (
                  <div className={[
                    "absolute left-0 mt-0 p-1.5 bg-white border border-slate-100 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150",
                    "min-w-[220px]"
                  ].join(' ')}>
                    <div className="grid grid-cols-1 gap-0.5">
                      {group.links.map((link) => (
                        <button
                          key={link.path}
                          onClick={() => {
                            navigate(link.path);
                            setActiveDropdown(null);
                          }}
                          className={[
                            'group flex items-start gap-3 rounded-lg p-2.5 cursor-pointer text-left w-full transition-all duration-150',
                            (location.pathname === link.path || location.pathname.startsWith(link.path + '/'))
                              ? 'bg-[#E6FFFA] text-[#319795]'
                              : 'hover:bg-[#F8F9FA] text-slate-700',
                          ].join(' ')}
                        >
                          <div className={[
                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
                            (location.pathname === link.path || location.pathname.startsWith(link.path + '/')) ? 'bg-[#E6FFFA]' : 'bg-slate-100 group-hover:bg-[#E6FFFA]',
                          ].join(' ')}>
                            {React.createElement(link.icon, {
                              size: 15,
                              strokeWidth: (location.pathname === link.path || location.pathname.startsWith(link.path + '/')) ? 2.2 : 1.8,
                              className: (location.pathname === link.path || location.pathname.startsWith(link.path + '/')) ? 'text-[#4FD1C5]' : 'text-slate-500 group-hover:text-[#4FD1C5]',
                            })}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className={['text-[13px] font-semibold leading-none', (location.pathname === link.path || location.pathname.startsWith(link.path + '/')) ? 'text-[#319795]' : 'text-slate-800'].join(' ')}>
                              {link.label}
                            </span>
                            <span className="text-[11.5px] text-slate-400 leading-snug mt-0.5">
                              {link.description}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
