import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, BarChart3, 
  Settings, PawPrint, Component, Megaphone, 
  Briefcase, HeadphonesIcon, ChevronRight, LogOut,
  Bell, Kanban, ClipboardList, UserPlus, Layers, Send,
  Ticket, Zap, ListOrdered
} from 'lucide-react';
import { crmState } from '../lib/crmState';

const mainNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pasien', label: 'Pasien', icon: Users },
  { path: '/jadwal', label: 'Jadwal Temu', icon: CalendarDays },
  { path: '/reminder', label: 'Reminder Vaksin', icon: Bell },
  { path: '/analitik', label: 'Analitik', icon: BarChart3 },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
  { path: '/components', label: 'Components', icon: Component },
];

const crmNavItems = [
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/sales', label: 'Sales', icon: Briefcase },
  { path: '/service', label: 'Layanan', icon: HeadphonesIcon },
  { path: '/pipeline', label: 'Pipeline Member', icon: Kanban },
  { path: '/followup', label: 'Follow-up Kunjungan', icon: ClipboardList },
  { path: '/leads', label: 'Lead Management', icon: UserPlus },
  { path: '/segmentasi', label: 'Segmentasi Member', icon: Layers },
  { path: '/blast', label: 'Pesan Massal', icon: Send },
  { path: '/tiket', label: 'Tiket Keluhan', icon: Ticket },
  { path: '/sla', label: 'SLA Monitor', icon: Zap },
];

const otherNavItems = [
  { path: '/antrian', label: 'Antrian Digital', icon: ListOrdered }
];

/* ── Single Nav Item ── */
function NavItem({ item, isActive, badge, badgeColor, isCollapsed }) {
  const Icon = item.icon;

  return (
    <div className="px-2 w-full" title={isCollapsed ? item.label : undefined}>
      <Link
        to={item.path}
        className={`relative flex items-center h-10 rounded-xl px-3 gap-3 text-[13.5px] font-medium transition-all duration-200 ease-out w-full ${
          isActive
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 hover:text-white'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
        }`}
      >
        <Icon
          size={17}
          strokeWidth={isActive ? 2.2 : 1.8}
          className={isActive ? 'text-white' : 'text-slate-400'}
        />
        {!isCollapsed && (
          <>
            <span className={`flex-1 truncate ${isActive ? 'font-semibold tracking-tight' : ''}`}>
              {item.label}
            </span>
            {badge !== undefined && badge > 0 && (
              <span className={`ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor || 'bg-amber-500'}`}>
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
  const isCollapsed = !isOpen;

  const [user, setUser] = useState({
    name: 'Dr. Muhammad Taufiq',
    role: 'Veterinario Principal',
    initials: 'DT',
  });
  const [badgeCount, setBadgeCount] = useState(0);
  const [ticketBadgeCount, setTicketBadgeCount] = useState(0);
  const [slaBadgeCount, setSlaBadgeCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    // Initial badge counts
    crmState.init();
    
    const vaccines = crmState.getVaccines();
    setBadgeCount(vaccines.filter(v => v.status === 'Belum Diingatkan').length);

    const tickets = crmState.getTickets();
    setTicketBadgeCount(tickets.filter(t => t.status === 'Baru').length);

    const sla = crmState.getSLAData();
    setSlaBadgeCount(sla.stats.violationsCount);

    // Sync on storage event
    const handleStorage = () => {
      const updatedVac = crmState.getVaccines();
      setBadgeCount(updatedVac.filter(v => v.status === 'Belum Diingatkan').length);

      const updatedTkt = crmState.getTickets();
      setTicketBadgeCount(updatedTkt.filter(t => t.status === 'Baru').length);

      const updatedSla = crmState.getSLAData();
      setSlaBadgeCount(updatedSla.stats.violationsCount);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isActive = (item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path);

  const sidebarWidthClass = isOpen ? 'w-64' : 'w-16';
  const sidebarMobileClass = mobileOpen ? 'translate-x-0' : '-translate-x-full';

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
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 md:z-30 flex flex-col h-full bg-white border-r border-slate-100 shadow-[2px_0_12px_0_rgba(0,0,0,0.04)] transition-all duration-300 ease-in-out overflow-hidden ${sidebarWidthClass} ${sidebarMobileClass} md:translate-x-0`}
      >
        {/* ── Brand ── */}
        <div className="px-4 pt-5 pb-4 shrink-0">
          <Link to="/" className="flex items-center gap-3 rounded-xl h-12 px-2 hover:bg-slate-50 transition-colors duration-150">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/30">
              <PawPrint size={17} className="text-white" strokeWidth={2.2} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-none gap-0.5">
                <span className="font-bold text-[15px] text-slate-800 tracking-tight">
                  PetCare<span className="text-emerald-500">.</span>
                </span>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Management System
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* ── Navigation List ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-4">
          {/* Main Group */}
          <div>
            {!isCollapsed && (
              <div className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Overview
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {mainNavItems.map((item) => (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  isActive={isActive(item)} 
                  badge={item.path === '/reminder' ? badgeCount : undefined}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>

          {/* CRM Group */}
          <div>
            {!isCollapsed && (
              <div className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                CRM
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {crmNavItems.map((item) => {
                let badge = undefined;
                let badgeColor = undefined;
                if (item.path === '/tiket') {
                  badge = ticketBadgeCount;
                  badgeColor = 'bg-red-500';
                } else if (item.path === '/sla') {
                  badge = slaBadgeCount;
                  badgeColor = 'bg-amber-500';
                }
                return (
                  <NavItem 
                    key={item.path} 
                    item={item} 
                    isActive={isActive(item)} 
                    badge={badge}
                    badgeColor={badgeColor}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </div>
          </div>

          {/* Other Group */}
          <div>
            {!isCollapsed && (
              <div className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Lainnya
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {otherNavItems.map((item) => (
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
              onClick={() => navigate('/profile')}
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

          {/* Logout */}
          <div className="flex items-center w-full mt-1">
            <button
              onClick={() => navigate('/login')}
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