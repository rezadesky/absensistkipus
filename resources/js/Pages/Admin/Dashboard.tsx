import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    FileText, 
    Settings, 
    ChevronRight,
    Building2,
    CalendarCheck
} from 'lucide-react';

interface Stats {
    totalPegawai: number;
    hadirTepatWaktu: number;
    terlambat: number;
    izin: number;
    belumAbsenCount: number;
}

interface UserSummary {
    id: number;
    name: string;
    nip?: string;
    unit_kerja?: string;
    jabatan?: string;
}

interface PresensiSummary {
    id: number;
    user: UserSummary;
    jam_masuk?: string;
    status: string;
    keterangan?: string;
}

interface IzinPending {
    id: number;
    user: UserSummary;
    jenis_izin: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    keterangan: string;
}

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    stats: Stats;
    presensiHariIni: PresensiSummary[];
    belumAbsen: UserSummary[];
    pengajuanIzinPending: IzinPending[];
    pengaturan?: any;
}

export default function AdminDashboard({ auth, stats, presensiHariIni, belumAbsen, pengajuanIzinPending, pengaturan }: Props) {
    const [activeTab, setActiveTab] = useState<'sudah' | 'belum'>('sudah');

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold text-[#0F2747]">Dashboard Administrator</h2>
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200/80">
                                Absensi Fungsional
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">Ringkasan status kehadiran seluruh pegawai STKIP Usman Safri hari ini</p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex items-center gap-2">
                        <Link
                            href={route('admin.users.index')}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Kelola Pegawai</span>
                        </Link>
                        <Link
                            href={route('admin.pengaturan.index')}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F2747] text-white hover:bg-[#163863] text-xs font-bold transition shadow-sm"
                        >
                            <Settings className="w-3.5 h-3.5 text-[#F28C28]" />
                            <span>Geofence</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard - STKIP Usman Safri" />

            <div className="space-y-4 sm:space-y-6">
                {/* Stats Grid - Responsive 2 Columns on Mobile, 5 on Desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total Pegawai</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-[#0F2747]">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalPegawai}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Dosen & Tendik aktif</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Tepat Waktu</span>
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-emerald-700 mt-2">{stats.hadirTepatWaktu}</p>
                        <p className="text-[11px] text-emerald-600/70 mt-0.5">Sesuai jam</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Terlambat</span>
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-amber-700 mt-2">{stats.terlambat}</p>
                        <p className="text-[11px] text-amber-600/70 mt-0.5">Lewat batas</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Izin / Cuti</span>
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-indigo-700 mt-2">{stats.izin}</p>
                        <p className="text-[11px] text-indigo-600/70 mt-0.5">Disetujui</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Belum Absen</span>
                            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-rose-700 mt-2">{stats.belumAbsenCount}</p>
                        <p className="text-[11px] text-rose-600/70 mt-0.5">Belum ada catatan</p>
                    </div>
                </div>

                {/* Main Content Grid: Attendance Tracking & Leave Requests */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Live Daily Attendance Status */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-[#0F2747]">Presensi Pegawai Hari Ini</h3>
                                <p className="text-xs text-slate-500">Pantau kehadiran real-time civitas akademika</p>
                            </div>

                            <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                                <button
                                    onClick={() => setActiveTab('sudah')}
                                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        activeTab === 'sudah' ? 'bg-white text-[#0F2747] shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    Sudah ({presensiHariIni.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('belum')}
                                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        activeTab === 'belum' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    Belum ({belumAbsen.length})
                                </button>
                            </div>
                        </div>

                        {/* 1. Mobile Card List for Attendance */}
                        <div className="block md:hidden p-3 space-y-2.5 max-h-[420px] overflow-y-auto">
                            {activeTab === 'sudah' ? (
                                presensiHariIni.length > 0 ? (
                                    presensiHariIni.map((p) => (
                                        <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs text-slate-800 truncate">{p.user?.name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{p.user?.unit_kerja || '-'}</p>
                                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Masuk: {p.jam_masuk || '-'}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                                                p.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-6 text-center text-xs text-slate-400">Belum ada presensi masuk hari ini.</p>
                                )
                            ) : (
                                belumAbsen.length > 0 ? (
                                    belumAbsen.map((u) => (
                                        <div key={u.id} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs text-slate-800 truncate">{u.name}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{u.unit_kerja || '-'}</p>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{u.nip || '-'}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-6 text-center text-xs text-emerald-600 font-bold">Semua pegawai telah presensi.</p>
                                )
                            )}
                        </div>

                        {/* 2. Desktop Table for Attendance */}
                        <div className="hidden md:block overflow-x-auto flex-1">
                            {activeTab === 'sudah' ? (
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3">Nama Pegawai</th>
                                            <th className="px-6 py-3">Unit Kerja</th>
                                            <th className="px-6 py-3">Jam Masuk</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {presensiHariIni.length > 0 ? (
                                            presensiHariIni.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-6 py-3.5">
                                                        <p className="font-bold text-slate-800">{p.user?.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">NIP: {p.user?.nip || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-xs text-slate-600">{p.user?.unit_kerja || '-'}</td>
                                                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-700">{p.jam_masuk || '-'}</td>
                                                    <td className="px-6 py-3.5">
                                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                                                            p.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs">
                                                    Belum ada pegawai yang melakukan presensi hari ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3">Nama Pegawai</th>
                                            <th className="px-6 py-3">NIP</th>
                                            <th className="px-6 py-3">Unit Kerja / Prodi</th>
                                            <th className="px-6 py-3">Jabatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {belumAbsen.length > 0 ? (
                                            belumAbsen.map((u) => (
                                                <tr key={u.id} className="hover:bg-rose-50/40 transition">
                                                    <td className="px-6 py-3.5 font-bold text-slate-800">{u.name}</td>
                                                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{u.nip || '-'}</td>
                                                    <td className="px-6 py-3.5 text-xs text-slate-600">{u.unit_kerja || '-'}</td>
                                                    <td className="px-6 py-3.5 text-xs text-slate-500">{u.jabatan || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-emerald-600 text-xs font-bold">
                                                    Luar biasa! Seluruh pegawai aktif telah melakukan presensi hari ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Pending Leave Requests Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm sm:text-base text-[#0F2747]">Izin Menunggu Persetujuan</h3>
                                <Link
                                    href={route('admin.izin.index')}
                                    className="text-xs font-bold text-[#F28C28] hover:underline flex items-center gap-1"
                                >
                                    Semua <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="space-y-2.5 sm:space-y-3">
                                {pengajuanIzinPending.length > 0 ? (
                                    pengajuanIzinPending.map((izin) => (
                                        <div key={izin.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-800">{izin.user?.name}</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 uppercase">
                                                    {izin.jenis_izin.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2">{izin.keterangan}</p>
                                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                                                <span>{izin.tanggal_mulai} s/d {izin.tanggal_selesai}</span>
                                                <Link
                                                    href={route('admin.izin.index')}
                                                    className="font-bold text-[#0F2747] hover:underline"
                                                >
                                                    Proses
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        Tidak ada permohonan izin yang menunggu persetujuan.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <Link
                                href={route('laporan.index')}
                                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                            >
                                <FileText className="w-4 h-4 text-[#0F2747]" />
                                <span>Buka Laporan & Rekap Lengkap</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
