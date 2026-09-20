import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Filter, 
    CheckCircle2, 
    Clock, 
    FileText, 
    AlertCircle, 
    Download 
} from 'lucide-react';

interface PresensiItem {
    id: number;
    tanggal: string;
    jam_masuk?: string;
    status: string;
    keterangan?: string;
}

interface Summary {
    hadir: number;
    terlambat: number;
    izin: number;
    alpa: number;
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            nip?: string;
            unit_kerja?: string;
        };
    };
    riwayat: {
        data: PresensiItem[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    summary: Summary;
    filters: {
        bulan: number;
        tahun: number;
    };
}

export default function RiwayatPresensi({ auth, riwayat, summary, filters }: Props) {
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

    const tahunOptions = [2025, 2026, 2027];

    const handleFilterChange = (key: string, value: any) => {
        router.get(
            route('presensi.riwayat'),
            {
                ...filters,
                [key]: value,
            },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hadir':
                return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> Hadir</span>;
            case 'terlambat':
                return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> Terlambat</span>;
            case 'izin':
            case 'cuti':
                return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1 w-fit"><FileText className="w-3.5 h-3.5" /> Izin / Cuti</span>;
            default:
                return <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 w-fit"><AlertCircle className="w-3.5 h-3.5" /> Alpa</span>;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            auth={auth as any}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-[#0F2747]">Riwayat & Rekap Presensi Pribadi</h2>
                        <p className="text-xs text-slate-500">Daftar kehadiran tercatat per periode bulan dan tahun</p>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition"
                    >
                        <Download className="w-4 h-4 text-[#F28C28]" />
                        <span>Cetak / Ekspor Rekap</span>
                    </button>
                </div>
            }
        >
            <Head title="Riwayat Presensi - STKIP Usman Safri" />

            <div className="space-y-6">
                {/* Filter & Summary Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">Filter Periode:</span>
                        </div>

                        <select
                            value={filters.bulan}
                            onChange={(e) => handleFilterChange('bulan', e.target.value)}
                            className="text-xs font-medium rounded-xl border-slate-200 bg-slate-50 focus:border-[#0F2747] focus:ring-[#0F2747]/20"
                        >
                            {bulanOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <select
                            value={filters.tahun}
                            onChange={(e) => handleFilterChange('tahun', e.target.value)}
                            className="text-xs font-medium rounded-xl border-slate-200 bg-slate-50 focus:border-[#0F2747] focus:ring-[#0F2747]/20"
                        >
                            {tahunOptions.map((yr) => (
                                <option key={yr} value={yr}>{yr}</option>
                            ))}
                        </select>
                    </div>

                    {/* Summary Counters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-800">Tepat Waktu</p>
                            <p className="text-xl font-bold text-emerald-900 mt-1">{summary.hadir} Hari</p>
                        </div>
                        <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                            <p className="text-xs font-semibold text-amber-800">Terlambat</p>
                            <p className="text-xl font-bold text-amber-900 mt-1">{summary.terlambat} Hari</p>
                        </div>
                        <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                            <p className="text-xs font-semibold text-blue-800">Izin / Cuti</p>
                            <p className="text-xl font-bold text-blue-900 mt-1">{summary.izin} Hari</p>
                        </div>
                        <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                            <p className="text-xs font-semibold text-rose-800">Alpa</p>
                            <p className="text-xl font-bold text-rose-900 mt-1">{summary.alpa} Hari</p>
                        </div>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Tanggal</th>
                                    <th className="px-6 py-3.5">Jam Masuk</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {riwayat.data.length > 0 ? (
                                    riwayat.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                                                {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(row.tanggal))}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-700">{row.jam_masuk || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{row.keterangan || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                            Tidak ditemukan data presensi pada periode yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
