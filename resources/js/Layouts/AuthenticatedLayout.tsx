import { useState, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    CalendarCheck, 
    History, 
    FileText, 
    Users, 
    Settings, 
    BarChart3, 
    LogOut, 
    User as UserIcon, 
    Menu, 
    X,
    ChevronRight,
    Shield,
    CheckCircle2,
    AlertCircle,
    AlertTriangle
} from 'lucide-react';

interface AuthenticatedLayoutProps {
    auth: any;
    header?: ReactNode;
    children: ReactNode;
}

export default function AuthenticatedLayout({ auth, header, children }: AuthenticatedLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const { flash } = usePage<any>().props;

    const user = auth?.user;
    const role = user?.role_type || 'dosen_tendik';

    // Role-based Nav Menu Definitions
    const getNavItems = () => {
        if (role === 'admin') {
            return [
                { name: 'Dashboard Admin', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
                { name: 'Data Pegawai', href: route('admin.users.index'), icon: Users, current: route().current('admin.users.*') },
                { name: 'Persetujuan Izin', href: route('admin.izin.index'), icon: FileText, current: route().current('admin.izin.*') },
                { name: 'Laporan & Rekap', href: route('laporan.index'), icon: BarChart3, current: route().current('laporan.index') },
                { name: 'Pengaturan & Geofence', href: route('admin.pengaturan.index'), icon: Settings, current: route().current('admin.pengaturan.*') },
            ];
        } else if (role === 'pimpinan') {
            return [
                { name: 'Dashboard Eksekutif', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
                { name: 'Laporan Kehadiran', href: route('laporan.index'), icon: BarChart3, current: route().current('laporan.index') },
            ];
        } else {
            // Dosen & Tendik
            return [
                { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
                { name: 'Riwayat Presensi', href: route('presensi.riwayat'), icon: History, current: route().current('presensi.riwayat') },
                { name: 'Pengajuan Izin/Cuti', href: route('izin.index'), icon: FileText, current: route().current('izin.*') },
            ];
        }
    };

    const navItems = getNavItems();

    const getRoleBadge = () => {
        if (role === 'admin') return <span className="bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200/80">Administrator</span>;
        if (role === 'pimpinan') return <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/80">Pimpinan</span>;
        return <span className="bg-blue-50 text-[#0F2747] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/80">Dosen / Tendik</span>;
    };

    const getMenuCategoryLabel = () => {
        if (role === 'admin') return 'Menu Administrasi';
        if (role === 'pimpinan') return 'Menu Eksekutif';
        return 'Menu Pegawai Fungsional';
    };

    const getPortalTitle = () => {
        if (role === 'admin') return 'Portal Administrasi Absensi Fungsional STKIP Usman Safri';
        if (role === 'pimpinan') return 'Portal Monitoring Eksekutif STKIP Usman Safri';
        return 'Portal Presensi Dosen & Tenaga Kependidikan STKIP Usman Safri';
    };

    // =========================================================================
    // UNIFIED DESKTOP SIDEBAR (100vh) & MOBILE APP (Bottom Nav) ARCHITECTURE
    // =========================================================================
    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-100 flex font-sans text-slate-800">
            {/* Mobile Sidebar Backdrop (Off-canvas drawer on mobile if opened) */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Desktop: Fixed Full Screen Height (h-screen) & Non-stretch */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 h-screen bg-[#0F2747] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out shrink-0
                lg:static lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Top: Brand Header & Nav List */}
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    {/* Sidebar Brand Header */}
                    <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 bg-[#0a1b32] shrink-0 sticky top-0 z-10">
                        <Link href={route('dashboard')} className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                                <img src="/logo.webp" alt="STKIP" className="h-full w-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                                    ABSENSI FUNGSIONAL
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">
                                    STKIP USMAN SAFRI
                                </span>
                            </div>
                        </Link>

                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links List */}
                    <div className="p-3 space-y-1 flex-1">
                        <p className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {getMenuCategoryLabel()}
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                                        item.current
                                            ? 'bg-[#F28C28] text-white shadow-lg shadow-orange-500/20'
                                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.current && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom: User Profile & Quick Logout */}
                <div className="p-3 border-t border-white/10 bg-[#0a1b32] shrink-0">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 mb-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#F28C28] to-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                            <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Link
                            href={route('profile.edit')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
                        >
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>Profil</span>
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex items-center justify-center p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                            title="Keluar Sistem"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area: Independent Scroll & Full Height */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Bar (Visible on desktop and mobile) */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-[#0F2747] flex items-center justify-center p-1 shadow-sm">
                                <img src="/logo.webp" alt="STKIP" className="h-full w-full object-contain" />
                            </div>
                            <span className="font-extrabold text-xs tracking-tight text-[#0F2747]">
                                ABSENSI FUNGSIONAL
                            </span>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Shield className="w-4 h-4 text-[#F28C28]" />
                            <span>{getPortalTitle()}</span>
                        </div>
                    </div>

                    {/* Right User Area */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                            <p className="text-[10px] text-slate-400">{user?.jabatan || user?.unit_kerja || 'Civitas Akademika'}</p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="h-9 w-9 rounded-full bg-[#0F2747] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-[#0F2747]/20 transition"
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </button>

                            {userDropdownOpen && (
                                <div 
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                    onClick={() => setUserDropdownOpen(false)}
                                >
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-xs text-slate-500">Masuk sebagai</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                                        <div className="mt-1.5">{getRoleBadge()}</div>
                                    </div>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0F2747] transition"
                                    >
                                        <UserIcon className="w-4 h-4 text-slate-400" />
                                        <span>Profil Saya</span>
                                    </Link>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-500" />
                                        <span>Keluar Sistem</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Sub Header if present */}
                {header && (
                    <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shrink-0">
                        <div className="max-w-7xl mx-auto">{header}</div>
                    </div>
                )}

                {/* Scrollable Content Container */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    <div className="max-w-7xl mx-auto space-y-4">
                        {/* Flash Notifications */}
                        {flash?.success && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div className="text-xs sm:text-sm font-semibold flex-1">{flash.success}</div>
                            </div>
                        )}

                        {flash?.error && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <div className="text-xs sm:text-sm font-semibold flex-1">{flash.error}</div>
                            </div>
                        )}

                        {flash?.warning && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="text-xs sm:text-sm font-semibold flex-1">{flash.warning}</div>
                            </div>
                        )}

                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar (Dosen, Tendik, Pimpinan, Admin) */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 lg:hidden flex justify-around items-center py-1.5 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-pb">
                {role === 'admin' ? (
                    <>
                        <Link
                            href={route('dashboard')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('dashboard') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Admin</span>
                        </Link>
                        <Link
                            href={route('admin.users.index')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('admin.users.*') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Pegawai</span>
                        </Link>
                        <Link
                            href={route('admin.izin.index')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('admin.izin.*') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Izin</span>
                        </Link>
                        <Link
                            href={route('laporan.index')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('laporan.index') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Laporan</span>
                        </Link>
                    </>
                ) : role === 'pimpinan' ? (
                    <>
                        <Link
                            href={route('dashboard')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('dashboard') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Monitoring</span>
                        </Link>
                        <Link
                            href={route('laporan.index')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('laporan.index') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Laporan</span>
                        </Link>
                        <Link
                            href={route('profile.edit')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('profile.edit') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <UserIcon className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Akun</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href={route('dashboard')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('dashboard') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <LayoutDashboard className={`w-5 h-5 ${route().current('dashboard') ? 'text-[#0F2747]' : 'text-slate-400'}`} />
                            <span className="mt-0.5 tracking-tight">Dashboard</span>
                        </Link>
                        <Link
                            href={route('presensi.riwayat')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('presensi.riwayat') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <History className={`w-5 h-5 ${route().current('presensi.riwayat') ? 'text-[#0F2747]' : 'text-slate-400'}`} />
                            <span className="mt-0.5 tracking-tight">Riwayat</span>
                        </Link>
                        <Link
                            href={route('izin.index')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('izin.*') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <FileText className={`w-5 h-5 ${route().current('izin.*') ? 'text-[#0F2747]' : 'text-slate-400'}`} />
                            <span className="mt-0.5 tracking-tight">Izin/Cuti</span>
                        </Link>
                        <Link
                            href={route('profile.edit')}
                            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] transition ${
                                route().current('profile.edit') ? 'text-[#0F2747] font-bold' : 'text-slate-400 font-medium'
                            }`}
                        >
                            <UserIcon className="w-5 h-5" />
                            <span className="mt-0.5 tracking-tight">Profil</span>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}


