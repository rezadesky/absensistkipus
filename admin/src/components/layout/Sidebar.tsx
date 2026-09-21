import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ShieldAlert,
  UserCog,
  CalendarCheck,
  History,
  FileSpreadsheet,
  FileCheck,
  FileText,
  Clock,
  CalendarOff,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import logoImg from '@/assets/logo.webp';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'MASTER DATA',
    items: [
      { label: 'Dosen', href: '/master/dosen', icon: GraduationCap },
      { label: 'Tendik', href: '/master/tendik', icon: Users },
      { label: 'Pimpinan', href: '/master/pimpinan', icon: ShieldAlert },
      { label: 'Admin', href: '/master/admin', icon: UserCog },
    ],
  },
  {
    title: 'ABSENSI',
    items: [
      { label: 'Absensi Hari Ini', href: '/attendance/today', icon: CalendarCheck },
      { label: 'Riwayat Absensi', href: '/attendance/history', icon: History },
      { label: 'Rekap Absensi', href: '/attendance/recap', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'IZIN',
    items: [
      { label: 'Pengajuan Izin', href: '/leave', icon: FileCheck },
    ],
  },
  {
    title: 'LAPORAN',
    items: [
      { label: 'Laporan Absensi', href: '/reports/attendance', icon: FileText },
      { label: 'Laporan Izin', href: '/reports/leave', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'PENGATURAN',
    items: [
      { label: 'Hari Kerja', href: '/settings/work-days', icon: Clock },
      { label: 'Hari Libur', href: '/settings/holidays', icon: CalendarOff },
      { label: 'Pengaturan Sistem', href: '/settings/system', icon: Settings },
    ],
  },
];

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onItemClick }) => {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#172554] text-slate-100 border-r border-slate-800 select-none',
        className
      )}
    >
      {/* Brand Header with Uploaded Logo */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-4 sm:py-5 border-b border-slate-800/80">
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-white/10 p-1 shrink-0">
          <img
            src={logoImg}
            alt="Logo STKIP Usman Safri"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate">
            STKIP USMAN SAFRI
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
            Absensi Dosen & Tendik
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 sidebar-scroll px-3 py-4 space-y-4 sm:space-y-5">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <h4 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User / Logout Action */}
      <div className="p-3 border-t border-slate-800">
        <Separator className="bg-slate-800 mb-2" />
        <button
          type="button"
          aria-label="Logout dari sesi sistem"
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
              logout();
            }
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
};
