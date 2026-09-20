import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    FileText, 
    Award,
    Calendar,
    ArrowRight
} from 'lucide-react';

interface Stats {
    totalPegawai: number;
    hadir: number;
    terlambat: number;
    izin: number;
    alpa: number;
    rateKehadiran: number;
}

interface TrendDay {
    tanggal: string;
    hadir: number;
    terlambat: number;
    izin: number;
    alpa: number;
}

interface UnitStat {
    unit: string;
    total: number;
    hadir: number;
    persentase: number;
}

interface Props {
    auth: {
        user: {
            name: string;
            jabatan?: string;
        };
    };
    stats: Stats;
    trendMingguan: TrendDay[];
    unitStats: UnitStat[];
}

export default function PimpinanDashboard({ auth, stats, trendMingguan, unitStats }: Props) {
    return (
        <AuthenticatedLayout
            auth={auth as any}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-[#0F2747]">Dashboard Monitoring Eksekutif</h2>
                            <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200/80">
                                Tingkat Pimpinan
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Ringkasan analitik dan tingkat kepatuhan kehadiran civitas akademika STKIP Usman Safri</p>
                    </div>

                    <Link
                        href={route('laporan.index')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2747] hover:bg-[#163863] active:scale-95 text-white font-bold text-xs shadow-md transition"
                    >
                        <BarChart3 className="w-4 h-4 text-[#F28C28]" />
                        <span>Laporan Lengkap & Ekspor</span>
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard Pimpinan - SiAbsen STKIP Usman Safri" />

            <div className="space-y-4 sm:space-y-6">
                {/* Rate Kehadiran Banner */}
                <div className="bg-gradient-to-r from-[#0F2747] via-[#15345d] to-[#1e3e6b] rounded-2xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="space-y-2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur">
                            <Award className="w-3.5 h-3.5 text-[#F28C28]" />
                            Tingkat Kehadiran Institusi Hari Ini
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black">
                            {stats.rateKehadiran}% Tingkat Partisipasi
                        </h3>
                        <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                            Sebanyak <strong className="text-white">{stats.hadir}</strong> dari <strong className="text-white">{stats.totalPegawai}</strong> pegawai aktif telah mencatatkan kehadiran di kampus STKIP Usman Safri Kutacane.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4 z-10">
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
                            <p className="text-[10px] sm:text-xs text-slate-300">Tepat Waktu</p>
                            <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.hadir - stats.terlambat}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
                            <p className="text-[10px] sm:text-xs text-slate-300">Terlambat</p>
                            <p className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-1">{stats.terlambat}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
                            <p className="text-[10px] sm:text-xs text-slate-300">Izin / Cuti</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-400 font-mono mt-1">{stats.izin}</p>
                        </div>
                    </div>
                </div>

                {/* Perbandingan Antar Unit Kerja / Prodi */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-sm sm:text-base text-[#0F2747]">Persentase Kehadiran per Unit Kerja / Prodi</h3>
                            <p className="text-xs text-slate-500">Monitoring perbandingan kepatuhan absensi per departemen hari ini</p>
                        </div>
                        <Link
                            href={route('laporan.index')}
                            className="text-xs font-bold text-[#F28C28] hover:underline inline-flex items-center gap-1"
                        >
                            <span className="hidden sm:inline">Lihat Detail</span> <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-3.5">
                        {unitStats.map((u) => (
                            <div key={u.unit} className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                    <span className="text-[#0F2747]">{u.unit}</span>
                                    <span className="font-mono text-slate-600">{u.hadir}/{u.total} Pegawai ({u.persentase}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            u.persentase >= 80 ? 'bg-emerald-500' : u.persentase >= 50 ? 'bg-[#F28C28]' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${u.persentase}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trend Mingguan Chart Visualization */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="pb-3 border-b border-slate-100">
                        <h3 className="font-bold text-sm sm:text-base text-[#0F2747]">Tren Kehadiran 7 Hari Terakhir</h3>
                        <p className="text-xs text-slate-500">Pola fluktuasi kehadiran harian Dosen dan Tenaga Kependidikan</p>
                    </div>

                    <div className="overflow-x-auto pb-2">
                        <div className="grid grid-cols-7 gap-2 text-center pt-2 min-w-[340px]">
                            {trendMingguan.map((day) => (
                                <div key={day.tanggal} className="flex flex-col items-center gap-1.5">
                                    <div className="h-32 sm:h-36 w-full max-w-[44px] bg-slate-50 rounded-xl p-1 flex flex-col justify-end gap-1 border border-slate-100">
                                        {day.hadir > 0 && (
                                            <div
                                                className="bg-[#0F2747] rounded-md w-full transition-all"
                                                style={{ height: `${Math.min(day.hadir * 20, 90)}%` }}
                                                title={`Hadir: ${day.hadir}`}
                                            />
                                        )}
                                        {day.terlambat > 0 && (
                                            <div
                                                className="bg-[#F28C28] rounded-md w-full transition-all"
                                                style={{ height: `${Math.min(day.terlambat * 15, 40)}%` }}
                                                title={`Terlambat: ${day.terlambat}`}
                                            />
                                        )}
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate w-full">{day.tanggal}</span>
                                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{day.hadir} Hadir</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-[#0F2747]" />
                            <span className="text-slate-600 font-medium">Hadir Tepat Waktu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-[#F28C28]" />
                            <span className="text-slate-600 font-medium">Terlambat</span>
                        </div>
                    </div>
                </div>

                {/* Quick Action App Grid (Mobile App Feel) */}
                <div className="grid grid-cols-3 gap-2.5 md:hidden">
                    <Link
                        href={route('laporan.index')}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2 active:scale-95 transition hover:border-[#0F2747]"
                    >
                        <div className="p-2.5 rounded-xl bg-orange-50 text-[#F28C28]">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Rekap Bulanan</span>
                    </Link>

                    <Link
                        href={route('laporan.index')}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2 active:scale-95 transition hover:border-[#0F2747]"
                    >
                        <div className="p-2.5 rounded-xl bg-blue-50 text-[#0F2747]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Log Harian</span>
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2 active:scale-95 transition hover:border-[#0F2747]"
                    >
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Profil Saya</span>
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}




