import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, BarChart3, 
  Settings, PawPrint, Component, ChevronRight, LogOut,
  Bell, ClipboardList, Layers, Send,
  Ticket, Zap, ListOrdered, ChevronDown,
  Wrench, DollarSign, Megaphone, UserCheck,
} from 'lucide-react';
import { vaccineService, ticketService, slaService } from '../lib/supabaseService';
import { useMemberAuth } from '../context/MemberAuthContext';
import logoImg from '../assets/logo.png';

// ── CRM Pilar Configuration ─────────────────────────────────────────────────
const CRM_PILLARS = {
  service: {
    label: 'Service Automation',
    icon: Wrench,
    color: '#3b5bdb',
    bgColor: '#eef2ff',
    items: [
      { path: '/service', label: 'Case Management', icon: Wrench },
      { path: '/jadwal', label: 'Jadwal Temu', icon: CalendarDays },
      { path: '/antrian', label: 'Antrian Digital', icon: ListOrdered },
      { path: '/tiket', label: 'Tiket Keluhan', icon: Ticket },
      { path: '/sla', label: 'SLA Monitor', icon: Zap },
    ],
  },
  sales: {
    label: 'Sales Automation',
    icon: DollarSign,
    color: '#0ca678',
    bgColor: '#e6fcf5',
    items: [
      { path: '/sales', label: 'Sales Pipeline', icon: DollarSign },
      { path: '/pipeline', label: 'Pipeline Member', icon: UserCheck },
      { path: '/followup', label: 'Follow-up Kunjungan', icon: ClipboardList },
      { path: '/leads', label: 'Lead Management', icon: UserCheck },
    ],
  },
  marketing: {
    label: 'Marketing Automation',
    icon: Megaphone,
    color: '#f76707',
    bgColor: '#fff4e6',
    items: [
      { path: '/marketing', label: 'Campaign Management', icon: Megaphone },
      { path: '/segmentasi', label: 'Segmentasi Member', icon: Layers },
      { path: '/blast', label: 'Pesan Massal', icon: Send },
      { path: '/reminder', label: 'Reminder Vaksin', icon: Bell },
    ],
  },
};

const mainNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pasien', label: 'Pasien', icon: Users },
  { path: '/admin/members', label: 'Kelola Member', icon: Users },
  { path: '/analitik', label: 'Analitik', icon: BarChart3 },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
  { path: '/components', label: 'Components', icon: Component },
];

function NavItem({ item, isActive, badge, badgeColor, isCollapsed }) {
  const Icon = item.icon;

  return (
    <div className="px-3 w-full" title={isCollapsed ? item.label : undefined}>
      <Link
        to={item.path}
        className={`relative flex items-center h-11 rounded-lg px-3 gap-3 text-sm font-medium transition-all duration-200 ease-out w-full ${
          isActive
            ? 'bg-[#4FD1C5] text-white shadow-[0_2px_12px_rgba(79,209,197,0.3)] hover:bg-[#4FD1C5] hover:text-white'
            : 'text-[#2D3748] hover:text-[#4FD1C5] hover:bg-[#F8F9FA]'
        }`}
      >
        <Icon
          size={17}
          strokeWidth={isActive ? 2.2 : 1.8}
          className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#4FD1C5]'}
        />
        {!isCollapsed && (
          <>
            <span className={`flex-1 truncate ${isActive ? 'font-semibold tracking-tight' : ''}`}>
              {item.label}
            </span>
            {badge !== undefined && badge > 0 && (
              <span className={`ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor || 'bg-[#4FD1C5]'}`}>
                {badge}
              </span>
            )}
            {isActive && badge === undefined && (
              <ChevronRight size={14} className="text-white/70 shrink-0" />
            )}
          </>
        )}
      </Link>
    </div>
  );
}

/* ── Main Sidebar ── */
const AppSidebar = ({ isOpen, setIsOpen, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { member, logout } = useMemberAuth();
  const isCollapsed = !isOpen;

  const user = member || {
    name: 'Admin',
    role: 'Administrator',
    initials: 'A'
  };
  
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [ticketBadgeCount, setTicketBadgeCount] = useState(0);
  const [slaBadgeCount, setSlaBadgeCount] = useState(0);

  const loadBadges = async () => {
    try {
      const vaccines = await vaccineService.getAll();
      setBadgeCount(vaccines.filter(v => v.status === 'Belum Diingatkan').length);

      const tickets = await ticketService.getAll();
      setTicketBadgeCount(tickets.filter(t => t.status === 'Baru').length);

      const sla = await slaService.getAll();
      setSlaBadgeCount(sla.stats.violationsCount || 0);
    } catch (err) {
      console.error('Failed to load Sidebar badge counts:', err);
    }
  };

  // Determine which pillar should be expanded based on current path
  useEffect(() => {
    const path = location.pathname;
    for (const [key, pillar] of Object.entries(CRM_PILLARS)) {
      if (pillar.items.some(item => path.startsWith(item.path))) {
        setExpandedPillar(key);
        break;
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    loadBadges();

    // Sync on storage and crm_change events
    const handleUpdate = () => {
      loadBadges();
    };
    
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('crm_change', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('crm_change', handleUpdate);
    };
  }, []);

  const togglePillar = (key) => {
    setExpandedPillar(expandedPillar === key ? null : key);
  };

  const isPillarActive = (items) =>
    items.some(item => location.pathname.startsWith(item.path));

  const isActive = (item) =>
    item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.path);

  const sidebarWidthClass = isOpen ? 'w-64' : 'w-16';
  const sidebarMobileClass = mobileOpen ? 'translate-x-0' : '-translate-x-full';

  // --- Fungsi Penanganan Logout ---
  const handleLogout = async () => {
    const isConfirm = window.confirm('Apakah Anda yakin ingin keluar?');
    if (isConfirm) {
      await logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 md:z-30 flex flex-col h-full bg-white shadow-[2px_0_12px_0_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out overflow-hidden ${sidebarWidthClass} ${sidebarMobileClass} md:translate-x-0`}
      >
        {/* ── Brand ── */}
        <div className="px-4 pt-5 pb-4 shrink-0">
          <Link to="/" className="flex items-center gap-3 rounded-xl h-12 px-2 hover:bg-slate-50 transition-colors duration-150">
            <img src={logoImg} alt="PetCare Clinic Logo" width="36" height="36" style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }} />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-none gap-0.5">
                <span className="font-bold text-[15px] text-slate-800 tracking-tight">
                  PetCare Clinic
                </span>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#A0AEC0]">
                  Management System
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* ── Navigation List ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-2">
          {/* Dashboard */}
          <div className="flex flex-col gap-0.5 px-3">
            <NavItem 
              item={{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }} 
              isActive={isActive({ path: '/dashboard' })} 
              isCollapsed={isCollapsed}
            />
          </div>

          {/* CRM Pillars */}
          <div>
            {!isCollapsed && (
              <div className="px-5 mb-1 mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A0AEC0]">
                CRM Platform
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {Object.entries(CRM_PILLARS).map(([key, pillar]) => {
                const Icon = pillar.icon;
                const isExpanded = expandedPillar === key;
                const active = isPillarActive(pillar.items);

                if (isCollapsed) {
                  // Collapsed: show first-level items only
                  return (
                    <div key={key} className="px-3">
                      <div className="w-full flex items-center h-10 gap-3 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ color: active ? pillar.color : '#64748b', background: active ? pillar.bgColor : 'transparent' }}
                        title={pillar.label}
                      >
                        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? pillar.color : '#94a3b8' }} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key} className="px-3">
                    {/* Pillar Header */}
                    <button
                      onClick={() => togglePillar(key)}
                      className="w-full flex items-center h-10 gap-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer outline-none"
                      style={{
                        color: active ? pillar.color : '#475569',
                        background: active ? pillar.bgColor : 'transparent',
                      }}
                      onMouseEnter={e => !active && (e.currentTarget.style.background = '#F8F9FA')}
                      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                    >
                      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? pillar.color : '#94a3b8' }} />
                      <span className="flex-1 text-left truncate" style={{ fontWeight: active ? 700 : 500 }}>{pillar.label}</span>
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', color: '#94a3b8' }}
                      />
                    </button>

                    {/* Sub-items */}
                    <div className="overflow-hidden transition-all duration-200" style={{
                      maxHeight: isExpanded ? '500px' : '0',
                      opacity: isExpanded ? 1 : 0,
                    }}>
                      <div className="flex flex-col gap-0.5 ml-3 mt-0.5 border-l-2 pl-2" style={{ borderColor: pillar.color + '30' }}>
                        {pillar.items.map((item) => {
                          let badge = undefined;
                          let badgeColor = undefined;
                          if (item.path === '/tiket') {
                            badge = ticketBadgeCount;
                            badgeColor = 'bg-[#F56565]';
                          } else if (item.path === '/sla') {
                            badge = slaBadgeCount;
                            badgeColor = 'bg-[#ED8936]';
                          } else if (item.path === '/reminder') {
                            badge = badgeCount;
                          }
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="relative flex items-center h-9 gap-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 w-full"
                              style={{
                                color: location.pathname.startsWith(item.path) ? pillar.color : '#64748b',
                                background: location.pathname.startsWith(item.path) ? pillar.bgColor : 'transparent',
                                textDecoration: 'none',
                              }}
                              onMouseEnter={e => {
                                if (!location.pathname.startsWith(item.path))
                                  e.currentTarget.style.background = '#F8F9FA';
                              }}
                              onMouseLeave={e => {
                                if (!location.pathname.startsWith(item.path))
                                  e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <item.icon size={15} strokeWidth={1.8} />
                              <span className="flex-1 truncate">{item.label}</span>
                              {badge !== undefined && badge > 0 && (
                                <span className={`ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor || 'bg-[#4FD1C5]'}`}>
                                  {badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Master Group */}
          <div>
            {!isCollapsed && (
              <div className="px-5 mb-1 mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A0AEC0]">
                Data Master
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {mainNavItems.filter(item => item.path !== '/dashboard').map((item) => (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  isActive={isActive(item)} 
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer / User ── */}
        <div className="shrink-0 p-2 border-t border-slate-100 bg-white">
          {/* User card */}
          <div className="flex items-center w-full">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center h-12 w-full px-3 gap-3 rounded-xl hover:bg-slate-50 transition-all duration-150 group cursor-pointer outline-none"
              title={isCollapsed ? user.name : undefined}
            >
              <div className="relative shrink-0">
                <div className="size-9 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-[12px]">
                    {user.initials || user.name?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="absolute -bottom-px -right-px size-2.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1 leading-none gap-0.5 text-left">
                  <span className="font-semibold text-[12.5px] text-slate-800 truncate">
                    {user.name}
                  </span>
                  <span className="text-[10.5px] text-slate-400 truncate font-normal">
                    {user.role}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Logout (Sudah Diperbaiki) */}
          <div className="flex items-center w-full mt-1">
            <button
              onClick={handleLogout}
              className="flex items-center h-9 w-full px-3 gap-3 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 cursor-pointer outline-none"
              title={isCollapsed ? "Keluar" : undefined}
            >
              <LogOut size={15} strokeWidth={1.8} className="shrink-0" />
              {!isCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;