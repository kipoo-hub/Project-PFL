import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, BarChart3, 
  Settings, PawPrint, Component, Megaphone, 
  Briefcase, HeadphonesIcon, ChevronRight, LogOut,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pasien', label: 'Pasien', icon: Users },
  { path: '/jadwal', label: 'Jadwal Temu', icon: CalendarDays },
  { path: '/analitik', label: 'Analitik', icon: BarChart3 },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
  { path: '/components', label: 'Components', icon: Component },
];

const crmNavItems = [
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/sales', label: 'Sales', icon: Briefcase },
  { path: '/service', label: 'Layanan', icon: HeadphonesIcon },
];

/* ── Single Nav Item ── */
function NavItem({ item, isActive }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const Icon = item.icon;

  return (
    <SidebarMenuItem className="px-2">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={`relative h-10 rounded-xl px-3 gap-3 text-[13.5px] font-medium transition-all duration-200 ease-out ${
          isActive
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 hover:text-white -ml-2 pl-5 pr-3 rounded-r-xl rounded-l-none'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
        }`}
      >
        <Link to={item.path} className="flex items-center gap-3 w-full">
          <Icon
            size={17}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={isActive ? 'text-white' : 'text-slate-400'}
          />
          <span className={`flex-1 truncate ${isActive ? 'font-semibold tracking-tight' : ''}`}>
            {item.label}
          </span>
          {isActive && !isCollapsed && (
            <ChevronRight size={14} className="text-white/70 shrink-0" />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/* ── Main Sidebar ── */
const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [user, setUser] = useState({
    name: 'Dr. Muhammad Taufiq',
    role: 'Veterinario Principal',
    initials: 'DT',
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const isActive = (item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path);

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="bg-white border-r border-slate-100 shadow-[2px_0_12px_0_rgba(0,0,0,0.04)]"
    >
      {/* ── Brand ── */}
      <SidebarHeader className="px-4 pt-5 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="PetCare Clinic"
              className="hover:bg-slate-50 rounded-xl h-12 px-2 gap-3"
            >
              <Link to="/">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/30">
                  <PawPrint size={17} className="text-white" strokeWidth={2.2} />
                </div>
                <div className="flex flex-col min-w-0 leading-none gap-0.5">
                  <span className="font-bold text-[15px] text-slate-800 tracking-tight">
                    PetCare<span className="text-emerald-500">.</span>
                  </span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Management System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="gap-0 overflow-x-hidden">
        {/* Main Group */}
        <SidebarGroup className="px-0 py-0">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Overview
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-0">
              {mainNavItems.map((item) => (
                <NavItem key={item.path} item={item} isActive={isActive(item)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CRM Group */}
        <SidebarGroup className="px-0 py-0 mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              CRM
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-0">
              {crmNavItems.map((item) => (
                <NavItem key={item.path} item={item} isActive={isActive(item)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / User ── */}
      <SidebarFooter className="p-0">
        <div className="mx-4 mb-3 h-px bg-slate-100" />
        <SidebarMenu className="px-2 pb-4 gap-1">
          {/* User card */}
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name}
              onClick={() => navigate('/profile')}
              className="h-12 px-3 gap-3 rounded-xl hover:bg-slate-50 transition-all duration-150 group"
            >
              <div className="relative shrink-0">
                <div className="size-9 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-[12px]">
                    {user.initials || user.name?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="absolute -bottom-px -right-px size-2.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1 leading-none gap-0.5">
                <span className="font-semibold text-[12.5px] text-slate-800 truncate">
                  {user.name}
                </span>
                <span className="text-[10.5px] text-slate-400 truncate font-normal">
                  {user.role}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Keluar"
              onClick={() => navigate('/login')}
              className="h-9 px-3 gap-3 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
            >
              <LogOut size={15} strokeWidth={1.8} />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;