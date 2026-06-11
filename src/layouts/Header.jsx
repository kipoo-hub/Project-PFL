import React, { useState, useEffect } from 'react';
import {
  Bell, Search, ChevronDown,
  LayoutDashboard, Users, CalendarDays,
  BarChart3, Megaphone, Briefcase,
  HeadphonesIcon, Settings, Component,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';

/* ─── Nav data ─────────────────────────────────────────────── */
const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    links: [
      { label: 'Overview',  description: 'Ringkasan klinik hari ini',      path: '/',        icon: LayoutDashboard },
      { label: 'Analitik',  description: 'Tren & statistik mendalam',       path: '/analitik', icon: BarChart3       },
    ],
  },
  {
    label: 'Pasien',
    icon: Users,
    links: [
      { label: 'Daftar Pasien', description: 'Kelola rekam medis pasien',    path: '/pasien',  icon: Users        },
      { label: 'Jadwal Temu',   description: 'Atur appointment & follow-up', path: '/jadwal',  icon: CalendarDays },
    ],
  },
  {
    label: 'CRM',
    icon: Briefcase,
    links: [
      { label: 'Marketing', description: 'Kampanye & promosi',          path: '/marketing', icon: Megaphone       },
      { label: 'Sales',     description: 'Pipeline & peluang penjualan', path: '/sales',     icon: Briefcase       },
      { label: 'Layanan',   description: 'Support & layanan pelanggan',  path: '/service',   icon: HeadphonesIcon  },
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

/* ─── NavLink card inside dropdown ─────────────────────────── */
function NavLinkCard({ item, isActive }) {
  const navigate = useNavigate();
  const Icon = item.icon;
  return (
    <NavigationMenuLink
      onClick={() => navigate(item.path)}
      className={[
        'group flex items-start gap-3 rounded-lg p-2.5 cursor-pointer select-none transition-all duration-150',
        isActive
          ? 'bg-emerald-50 text-emerald-700'
          : 'hover:bg-slate-50 text-slate-700',
      ].join(' ')}
    >
      <div className={[
        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
        isActive ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-emerald-50',
      ].join(' ')}>
        <Icon
          size={15}
          strokeWidth={isActive ? 2.2 : 1.8}
          className={isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-500'}
        />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className={['text-[13px] font-semibold leading-none', isActive ? 'text-emerald-700' : 'text-slate-800'].join(' ')}>
          {item.label}
        </span>
        <span className="text-[11.5px] text-slate-400 leading-snug mt-0.5">
          {item.description}
        </span>
      </div>
    </NavigationMenuLink>
  );
}

/* ─── Main Header ───────────────────────────────────────────── */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Dr. Taufiq', role: 'Dokter Hewan', initials: 'DT' });
  const [notifCount] = useState(3);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  /* Check if any link in a group is active */
  const isGroupActive = (links) =>
    links.some(
      (l) => location.pathname === l.path || location.pathname.startsWith(l.path + '/')
    );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-[0_1px_8px_0_rgba(0,0,0,0.05)]">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex h-13 items-center gap-3 px-4">

        {/* Left: Toggle + Divider + Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SidebarTrigger
            id="header-sidebar-trigger"
            className="shrink-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-150"
          />

          <Separator orientation="vertical" className="h-4 bg-slate-200" />

          {/* Search */}
          <div className="relative max-w-[260px] w-full">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              id="header-search-input"
              type="search"
              placeholder="Cari pasien, jadwal…"
              className="pl-8 h-8 text-[13px] bg-slate-50 border-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-emerald-300 focus-visible:ring-emerald-100 rounded-lg transition-all duration-150"
            />
          </div>
        </div>

        {/* Right: Notif + Divider + User */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Notification */}
          <div className="relative">
            <Button
              id="header-notification-btn"
              variant="ghost"
              size="icon"
              aria-label="Notifikasi"
              className="size-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative"
            >
              <Bell size={16} strokeWidth={1.8} />
            </Button>
            {notifCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold bg-red-500 text-white border-2 border-white rounded-full flex items-center justify-center pointer-events-none"
              >
                {notifCount}
              </Badge>
            )}
          </div>

          <Separator orientation="vertical" className="h-4 bg-slate-200" />

          {/* User profile */}
          <Button
            id="header-profile-btn"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-2 h-8 hover:bg-slate-100 rounded-lg transition-colors duration-150"
          >
            {/* Avatar */}
            <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0 ring-2 ring-white shadow-sm">
              {user.initials || user.name?.slice(0, 2).toUpperCase()}
            </div>
            {/* Name + role */}
            <div className="hidden sm:flex flex-col text-left leading-none gap-0.5">
              <span className="text-[12.5px] font-semibold text-slate-800 leading-none">{user.name}</span>
              <span className="text-[10.5px] text-slate-400 leading-none">{user.role}</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </Button>

        </div>
      </div>

      {/* ── Navigation bar ──────────────────────────────────── */}
      <div className="px-3 pb-0 flex items-center border-t border-slate-50">
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-0">
            {navItems.map((group) => {
              const active = isGroupActive(group.links);
              return (
                <NavigationMenuItem key={group.label}>
                  <NavigationMenuTrigger
                    className={[
                      'h-9 px-3 text-[12.5px] font-medium rounded-none border-b-2 transition-all duration-150',
                      'hover:bg-transparent focus:bg-transparent data-open:bg-transparent',
                      active
                        ? 'border-b-emerald-500 text-emerald-700 font-semibold'
                        : 'border-b-transparent text-slate-500 hover:text-slate-800',
                    ].join(' ')}
                  >
                    {group.label}
                  </NavigationMenuTrigger>

                  <NavigationMenuContent className="min-w-[220px] p-1.5">
                    <div className="grid gap-0.5">
                      {group.links.map((link) => (
                        <NavLinkCard
                          key={link.path}
                          item={link}
                          isActive={
                            location.pathname === link.path ||
                            location.pathname.startsWith(link.path + '/')
                          }
                        />
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Header;
