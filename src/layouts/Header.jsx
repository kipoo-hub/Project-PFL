import React, { useState, useEffect } from 'react';
import {
  Bell, Search, ChevronDown,
  LayoutDashboard, Users, CalendarDays,
  BarChart3, Megaphone, Briefcase,
  HeadphonesIcon, Settings, Component,
  Kanban, ClipboardList, UserPlus, Layers, Send, Ticket, Zap, ListOrdered
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/* ─── Nav data ─────────────────────────────────────────────── */
const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    links: [
      { label: 'Overview',  description: 'Ringkasan klinik hari ini',      path: '/',        icon: LayoutDashboard },
      { label: 'Analitik',  description: 'Tren & statistik mendalam',       path: '/analitik', icon: BarChart3       },
      { label: 'Reminder Vaksin', description: 'Pengingat jadwal vaksinasi pasien', path: '/reminder', icon: Bell },
    ],
  },
  {
    label: 'Pasien',
    icon: Users,
    links: [
      { label: 'Daftar Pasien', description: 'Kelola rekam medis pasien',    path: '/pasien',  icon: Users        },
      { label: 'Jadwal Temu',   description: 'Atur appointment & jadwal',    path: '/jadwal',  icon: CalendarDays },
      { label: 'Antrian Digital', description: 'Antrean kunjungan klinik',   path: '/antrian', icon: ListOrdered  },
    ],
  },
  {
    label: 'CRM',
    icon: Briefcase,
    links: [
      { label: 'Marketing', description: 'Kampanye & promosi',          path: '/marketing', icon: Megaphone       },
      { label: 'Sales',     description: 'Pipeline & peluang penjualan', path: '/sales',     icon: Briefcase       },
      { label: 'Layanan',   description: 'Support & layanan pelanggan',  path: '/service',   icon: HeadphonesIcon  },
      { label: 'Pipeline Member', description: 'Kanban board member',    path: '/pipeline',  icon: Kanban          },
      { label: 'Follow-up Kunjungan', description: 'Checklist kunjungan pasien', path: '/followup', icon: ClipboardList },
      { label: 'Lead Management', description: 'Kelola leads & calon pasien', path: '/leads',     icon: UserPlus        },
      { label: 'Segmentasi Member', description: 'Segmentasi target pasar',   path: '/segmentasi', icon: Layers         },
      { label: 'Pesan Massal',     description: 'Kirim WA & email massal',   path: '/blast',      icon: Send           },
      { label: 'Tiket Keluhan',    description: 'Tiket keluhan pelanggan',   path: '/tiket',      icon: Ticket         },
      { label: 'SLA Monitor',      description: 'Monitor response time keluhan', path: '/sla',    icon: Zap            },
    ],
  },
  {
    label: 'Lainnya',
    icon: Settings,
    links: [
      { label: 'Pengaturan', description: 'Konfigurasi sistem & akun', path: '/pengaturan', icon: Settings   },
      { label: 'Components', description: 'UI Component showcase',     path: '/components', icon: Component  },
    ],
  },
];


/* ─── Main Header ───────────────────────────────────────────── */
const Header = ({ toggleSidebar, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Dr. Taufiq', role: 'Dokter Hewan', initials: 'DT' });
  const [notifCount] = useState(3);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

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
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-2 h-8 hover:bg-[#F8F9FA] rounded-lg transition-colors duration-150 cursor-pointer outline-none"
          >
            {/* Avatar */}
            <div className="size-7 rounded-full bg-gradient-to-br from-[#4FD1C5] to-[#319795] flex items-center justify-center text-white font-bold text-[10px] shrink-0 ring-2 ring-white shadow-sm">
              {user.initials || user.name?.slice(0, 2).toUpperCase()}
            </div>
            {/* Name + role */}
            <div className="hidden sm:flex flex-col text-left leading-none gap-0.5">
              <span className="text-[12.5px] font-bold text-[#2D3748] leading-none">{user.name}</span>
              <span className="text-[10.5px] text-[#A0AEC0] leading-none">{user.role}</span>
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
                    group.links.length > 4 ? "min-w-[260px] sm:min-w-[460px] w-auto sm:w-[460px]" : "min-w-[220px]"
                  ].join(' ')}>
                    <div className={['grid gap-0.5', group.links.length > 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'].join(' ')}>
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
