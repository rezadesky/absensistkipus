import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Filter, 
    Printer,
    User,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Building2
} from 'lucide-react';

interface PresensiItem {
    id: number;
    tanggal: string;
    jam_masuk?: string;
    status: string;
    user: {
        id: number;
        name: string;
        nip?: string;
        unit_kerja?: string;
        jabatan?: string;
    };
    keterangan?: string;
}

interface RekapItem {
    user_id: number;
    name: string;
    nip?: string;
    unit_kerja?: string;
    hadir: number;
    terlambat: number;
    izin: number;
    alpa: number;
    total_kehadiran: number;
}

interface Props {
    auth: {
        user: {
            name: string;
            role_type?: string;
        };
    };
    presensi: {
        data: PresensiItem[];
        current_page: number;
        last_page: number;
    };
    rekapPegawai: RekapItem[];
    filters: {
        bulan: number;
        tahun: number;
        unit?: string;
        status?: string;
    };
    unitOptions: string[];
}

export default function LaporanIndex({ auth, presensi, rekapPegawai, filters, unitOptions }: Props) {
    const [viewMode, setViewMode] = useState<'rekap' | 'detail'>('rekap');

    const bulanOptions = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' },
    ];

    const handleFilterChange = (key: string, val: any) => {
        router.get(
            route('laporan.index'),
            {
                ...filters,
                [key]: val,
            },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hadir':
                return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Hadir</span>;
            case 'terlambat':
                return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Terlambat</span>;
            case 'izin':
            case 'cuti':
                return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Izin / Cuti</span>;
            default:
                return <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> Alpa</span>;
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth as any}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-[#0F2747]">Laporan & Rekapitulasi Presensi</h2>
                        <p className="text-xs text-slate-500">Laporan kehadiran fungsional STKIP Usman Safri Kutacane</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition active:scale-95"
                        >
                            <Printer className="w-4 h-4 text-[#F28C28]" />
                            <span>Cetak PDF / Print</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Laporan & Rekap Presensi - SiAbsen" />

            <div className="space-y-4 sm:space-y-6">
                {/* Filter & View Switcher */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
                        <div className="col-span-2 sm:w-auto flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span>Filter Laporan:</span>
                        </div>

                        <select
                            value={filters.bulan}
                            onChange={(e) => handleFilterChange('bulan', e.target.value)}
                            className="text-xs font-medium rounded-xl border-slate-200 bg-slate-50"
                        >
                            {bulanOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <select
                            value={filters.tahun}
                            onChange={(e) => handleFilterChange('tahun', e.target.value)}
                            className="text-xs font-medium rounded-xl border-slate-200 bg-slate-50"
                        >
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                            <option value={2027}>2027</option>
                        </select>

                        <select
                            value={filters.unit || 'semua'}
                            onChange={(e) => handleFilterChange('unit', e.target.value)}
                            className="col-span-2 sm:col-auto text-xs font-medium rounded-xl border-slate-200 bg-slate-50"
                        >
                            <option value="semua">Semua Unit / Prodi</option>
                            {unitOptions.map((unit) => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode('rekap')}
                            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition text-center ${
                                viewMode === 'rekap' ? 'bg-white text-[#0F2747] shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Rekap Bulanan Pegawai
                        </button>
                        <button
                            onClick={() => setViewMode('detail')}
                            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition text-center ${
                                viewMode === 'detail' ? 'bg-white text-[#0F2747] shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Log Detail Harian
                        </button>
                    </div>
                </div>

                {/* Content Data */}
                {viewMode === 'rekap' ? (
                    <div className="space-y-4">
                        {/* Mobile Rekap Cards */}
                        <div className="grid grid-cols-1 gap-3.5 md:hidden">
                            {rekapPegawai.length > 0 ? (
                                rekapPegawai.map((row) => (
                                    <div key={row.user_id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{row.name}</h4>
                                                <p className="text-[11px] text-slate-400 font-mono">NIP: {row.nip || '-'}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{row.unit_kerja || '-'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Hadir</span>
                                                <span className="text-base font-black text-[#0F2747]">{row.total_kehadiran} <span className="text-xs font-medium">Hari</span></span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
                                            <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                                                <p className="text-[10px] font-bold text-emerald-700">Tepat</p>
                                                <p className="text-sm font-black text-emerald-800">{row.hadir}</p>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-100 p-2 rounded-xl">
                                                <p className="text-[10px] font-bold text-amber-700">Telat</p>
                                                <p className="text-sm font-black text-amber-800">{row.terlambat}</p>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl">
                                                <p className="text-[10px] font-bold text-blue-700">Izin</p>
                                                <p className="text-sm font-black text-blue-800">{row.izin}</p>
                                            </div>
                                            <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl">
                                                <p className="text-[10px] font-bold text-rose-700">Alpa</p>
                                                <p className="text-sm font-black text-rose-800">{row.alpa}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                                    Tidak ditemukan data pegawai untuk periode ini.
                                </div>
                            )}
                        </div>

                        {/* Desktop Rekap Table */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-sm text-[#0F2747]">
                                    Rekapitulasi Kehadiran Pegawai Bulan {bulanOptions.find((b) => b.value === Number(filters.bulan))?.label} {filters.tahun}
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3.5">Nama Pegawai & NIP</th>
                                            <th className="px-6 py-3.5">Unit Kerja</th>
                                            <th className="px-6 py-3.5 text-center text-emerald-700">Hadir</th>
                                            <th className="px-6 py-3.5 text-center text-amber-700">Terlambat</th>
                                            <th className="px-6 py-3.5 text-center text-blue-700">Izin/Cuti</th>
                                            <th className="px-6 py-3.5 text-center text-rose-700">Alpa</th>
                                            <th className="px-6 py-3.5 text-center font-bold text-slate-800">Total Kehadiran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rekapPegawai.length > 0 ? (
                                            rekapPegawai.map((row) => (
                                                <tr key={row.user_id} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-800">{row.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">NIP: {row.nip || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-600">{row.unit_kerja || '-'}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{row.hadir}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-amber-600">{row.terlambat}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-blue-600">{row.izin}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-rose-600">{row.alpa}</td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-800 bg-slate-50/50">
                                                        {row.total_kehadiran} Hari
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                    Tidak ditemukan data pegawai untuk periode ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Mobile Daily Log Cards */}
                        <div className="grid grid-cols-1 gap-3.5 md:hidden">
                            {presensi.data.length > 0 ? (
                                presensi.data.map((p) => (
                                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{p.user?.name}</h4>
                                                <p className="text-[11px] text-slate-500">{p.user?.unit_kerja || '-'}</p>
                                            </div>
                                            <div>{getStatusBadge(p.status)}</div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                                            <span className="text-slate-500">
                                                {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(p.tanggal))}
                                            </span>
                                            <span className="font-mono font-bold text-[#0F2747] bg-slate-100 px-2 py-0.5 rounded-md">
                                                Masuk: {p.jam_masuk || '-'}
                                            </span>
                                        </div>

                                        {p.keterangan && (
                                            <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                                                {p.keterangan}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                                    Tidak ditemukan log presensi pada periode ini.
                                </div>
                            )}
                        </div>

                        {/* Desktop Daily Log Table */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-sm text-[#0F2747]">Log Riwayat Presensi Harian</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3.5">Tanggal</th>
                                            <th className="px-6 py-3.5">Pegawai</th>
                                            <th className="px-6 py-3.5">Jam Masuk</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {presensi.data.length > 0 ? (
                                            presensi.data.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                                                        {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(p.tanggal))}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-800">{p.user?.name}</p>
                                                        <p className="text-[11px] text-slate-400">{p.user?.unit_kerja || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{p.jam_masuk || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">{p.keterangan || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    Tidak ditemukan log presensi pada periode ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

