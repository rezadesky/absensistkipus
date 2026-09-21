import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Menu, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
}

const breadcrumbMap: Record<string, { parent?: string; title: string }> = {
  '/dashboard': { title: 'Dashboard' },
  '/master/dosen': { parent: 'Master Data', title: 'Data Dosen' },
  '/master/tendik': { parent: 'Master Data', title: 'Data Tendik' },
  '/master/pimpinan': { parent: 'Master Data', title: 'Data Pimpinan' },
  '/master/admin': { parent: 'Master Data', title: 'Data Administrator' },
  '/attendance/today': { parent: 'Absensi', title: 'Absensi Hari Ini' },
  '/attendance/history': { parent: 'Absensi', title: 'Riwayat Absensi' },
  '/attendance/recap': { parent: 'Absensi', title: 'Rekap Absensi' },
  '/leave': { parent: 'Izin', title: 'Pengajuan Izin' },
  '/reports/attendance': { parent: 'Laporan', title: 'Laporan Absensi' },
  '/reports/leave': { parent: 'Laporan', title: 'Laporan Izin' },
  '/settings/work-days': { parent: 'Pengaturan', title: 'Pengaturan Hari Kerja' },
  '/settings/holidays': { parent: 'Pengaturan', title: 'Pengaturan Hari Libur' },
  '/settings/system': { parent: 'Pengaturan', title: 'Pengaturan Sistem' },
};

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentRoute = breadcrumbMap[location.pathname] || { title: 'Admin Web' };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full max-w-full items-center justify-between border-b border-border bg-card px-3 sm:px-6 shadow-xs overflow-hidden">
      {/* Left side: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-8 w-8 sm:h-9 sm:w-9 text-secondary shrink-0 cursor-pointer"
          onClick={onMenuClick}
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm min-w-0">
          {currentRoute.parent && (
            <>
              <span className="text-muted-foreground hidden xs:inline truncate">{currentRoute.parent}</span>
              <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground hidden xs:inline shrink-0" />
            </>
          )}
          <span className="font-semibold text-secondary truncate">{currentRoute.title}</span>
        </nav>
      </div>

      {/* Right side: Notifications & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Notification button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full text-secondary hover:bg-muted"
          aria-label="Lihat Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 h-auto hover:bg-muted/80 rounded-lg cursor-pointer"
              aria-label="Menu profil admin"
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarFallback className="bg-secondary text-white text-[10px] sm:text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-secondary leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  Super Administrator
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-secondary">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-xs">
              <User className="mr-2 h-3.5 w-3.5" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-xs">
              <Settings className="mr-2 h-3.5 w-3.5" />
              <span>Pengaturan Akun</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-xs text-red-600 focus:text-red-600"
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                  logout();
                }
              }}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
