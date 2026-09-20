import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    FilePlus2, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Paperclip, 
    Calendar,
    ChevronRight,
    FileText,
    ExternalLink,
    Building2,
    Eye,
    X
} from 'lucide-react';

interface PengajuanItem {
    id: number;
    jenis_izin: 'sakit' | 'keperluan_pribadi' | 'dinas_luar' | 'cuti_tahunan';
    tanggal_mulai: string;
    tanggal_selesai: string;
    keterangan: string;
    lampiran?: string;
    status: 'menunggu' | 'disetujui' | 'ditolak';
    catatan_admin?: string;
    created_at: string;
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    pengajuan: {
        data: PengajuanItem[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function IzinIndex({ auth, pengajuan }: Props) {
    const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

    const getJenisLabel = (jenis: string) => {
        switch (jenis) {
            case 'sakit': return 'Izin Sakit';
            case 'keperluan_pribadi': return 'Keperluan Pribadi';
            case 'dinas_luar': return 'Tugas / Dinas Luar';
            case 'cuti_tahunan': return 'Cuti Tahunan';
            default: return jenis;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disetujui':
                return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Disetujui</span>;
            case 'ditolak':
                return <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>;
            default:
                return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Menunggu</span>;
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-[#0F2747] tracking-tight">
                            Permohonan Izin & Cuti Pegawai
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500">
                            Ajukan surat izin dan pantau status persetujuan dari pimpinan
                        </p>
                    </div>

                    <Link
                        href={route('izin.create')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition"
                    >
                        <FilePlus2 className="w-4 h-4" />
                        <span>Ajukan Permohonan Baru</span>
                    </Link>
                </div>
            }
        >
            <Head title="Pengajuan Izin & Cuti - STKIP Usman Safri" />

            <div className="space-y-4 sm:space-y-6">
                {/* Mobile Cards View (< sm) */}
                <div className="grid grid-cols-1 gap-3.5 sm:hidden">
                    {pengajuan.data.length > 0 ? (
                        pengajuan.data.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-xs font-black text-[#0F2747] block">
                                            {getJenisLabel(item.jenis_izin)}
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-medium">
                                            {item.tanggal_mulai} s/d {item.tanggal_selesai}
                                        </span>
                                    </div>
                                    <div>{getStatusBadge(item.status)}</div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                                    <p className="text-slate-600 italic">"{item.keterangan}"</p>
                                    
                                    {item.lampiran && (
                                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                            <span className="text-slate-500 text-[11px] font-medium">Dokumen Bukti:</span>
                                            <a
                                                href={`/storage/${item.lampiran}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[#F28C28] font-bold hover:underline text-xs"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Buka Lampiran
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {item.catatan_admin && (
                                    <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-600">
                                        <span className="font-bold text-slate-700">Catatan Admin:</span> {item.catatan_admin}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 text-xs">
                            Belum ada permohonan izin atau cuti yang diajukan.
                        </div>
                    )}
                </div>

                {/* Desktop Table View (>= sm) */}
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Jenis Permohonan</th>
                                    <th className="px-6 py-3.5">Periode Tanggal</th>
                                    <th className="px-6 py-3.5">Alasan / Keterangan</th>
                                    <th className="px-6 py-3.5">Dokumen Surat</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Catatan Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pengajuan.data.length > 0 ? (
                                    pengajuan.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                                                {getJenisLabel(item.jenis_izin)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                                                {item.tanggal_mulai} s/d {item.tanggal_selesai}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">{item.keterangan}</td>
                                            <td className="px-6 py-4 text-xs whitespace-nowrap">
                                                {item.lampiran ? (
                                                    <a
                                                        href={`/storage/${item.lampiran}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#F28C28] hover:bg-orange-100 font-bold transition"
                                                    >
                                                        <Paperclip className="w-3.5 h-3.5" /> Lihat Surat
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Tidak ada</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs">{item.catatan_admin || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                                            Belum ada pengajuan izin atau cuti yang tercatat.
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
