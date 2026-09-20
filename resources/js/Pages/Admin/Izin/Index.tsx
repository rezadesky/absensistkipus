import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Paperclip, 
    Filter, 
    MessageSquare,
    X,
    User,
    Calendar,
    Check,
    Building2
} from 'lucide-react';

interface PengajuanItem {
    id: number;
    user: {
        id: number;
        name: string;
        nip?: string;
        unit_kerja?: string;
        jabatan?: string;
    };
    jenis_izin: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    keterangan: string;
    lampiran?: string;
    status: 'menunggu' | 'disetujui' | 'ditolak';
    catatan_admin?: string;
    approver?: {
        name: string;
    };
}

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    pengajuan: {
        data: PengajuanItem[];
        current_page: number;
        last_page: number;
    };
    statusFilter: string;
}

export default function AdminIzinIndex({ auth, pengajuan, statusFilter }: Props) {
    const [selectedIzin, setSelectedIzin] = useState<PengajuanItem | null>(null);
    const [actionType, setActionType] = useState<'disetujui' | 'ditolak'>('disetujui');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const form = useForm({
        status: 'disetujui',
        catatan_admin: '',
    });

    const handleFilter = (status: string) => {
        router.get(route('admin.izin.index'), { status }, { preserveState: true });
    };

    const openActionModal = (item: PengajuanItem, status: 'disetujui' | 'ditolak') => {
        setSelectedIzin(item);
        setActionType(status);
        form.setData({
            status: status,
            catatan_admin: status === 'disetujui' ? 'Permohonan disetujui.' : 'Mohon maaf, permohonan belum dapat disetujui.',
        });
        setIsActionModalOpen(true);
    };

    const handleActionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIzin) return;

        form.patch(route('admin.izin.status', selectedIzin.id), {
            onSuccess: () => {
                setIsActionModalOpen(false);
                setSelectedIzin(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disetujui':
                return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Disetujui</span>;
            case 'ditolak':
                return <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>;
            default:
                return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Menunggu</span>;
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth as any}
            header={
                <div>
                    <h2 className="text-xl font-bold text-[#0F2747]">Persetujuan Izin & Cuti Pegawai</h2>
                    <p className="text-xs text-slate-500">Tinjau, setujui, atau tolak permohonan izin dari Dosen & Tendik</p>
                </div>
            }
        >
            <Head title="Persetujuan Izin - Admin SiAbsen" />

            <div className="space-y-4 sm:space-y-6">
                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
                    {['semua', 'menunggu', 'disetujui', 'ditolak'].map((st) => (
                        <button
                            key={st}
                            onClick={() => handleFilter(st)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                                (statusFilter || 'semua') === st
                                    ? 'bg-[#0F2747] text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st === 'semua' ? 'Semua Status' : st}
                        </button>
                    ))}
                </div>

                {/* Mobile Card List (Visible on screens < md) */}
                <div className="grid grid-cols-1 gap-3.5 md:hidden">
                    {pengajuan.data.length > 0 ? (
                        pengajuan.data.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.user?.name}</h4>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                            <span>NIP: {item.user?.nip || '-'}</span>
                                            <span>•</span>
                                            <span>{item.user?.unit_kerja || '-'}</span>
                                        </div>
                                    </div>
                                    <div>{getStatusBadge(item.status)}</div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Jenis Pengajuan:</span>
                                        <span className="font-bold capitalize text-[#0F2747]">{item.jenis_izin.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Periode:</span>
                                        <span className="font-semibold text-slate-800">{item.tanggal_mulai} s/d {item.tanggal_selesai}</span>
                                    </div>
                                    {item.lampiran && (
                                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                            <span className="text-slate-500 font-medium">Dokumen:</span>
                                            <a
                                                href={`/storage/${item.lampiran}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                            >
                                                <Paperclip className="w-3.5 h-3.5" /> Buka File
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {item.keterangan && (
                                    <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-xl italic">
                                        "{item.keterangan}"
                                    </p>
                                )}

                                {item.status === 'menunggu' ? (
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                        <button
                                            onClick={() => openActionModal(item, 'disetujui')}
                                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                                        >
                                            <Check className="w-4 h-4" /> Setujui
                                        </button>
                                        <button
                                            onClick={() => openActionModal(item, 'ditolak')}
                                            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                                        >
                                            <X className="w-4 h-4" /> Tolak
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Diproses oleh:</span>
                                        <span className="font-semibold text-slate-700">{item.approver?.name || 'Admin'}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                            Tidak ada permohonan izin dengan status yang dipilih.
                        </div>
                    )}
                </div>

                {/* Desktop Table (Hidden on screens < md) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Pegawai</th>
                                    <th className="px-6 py-3.5">Jenis Permohonan</th>
                                    <th className="px-6 py-3.5">Periode Tanggal</th>
                                    <th className="px-6 py-3.5">Keterangan</th>
                                    <th className="px-6 py-3.5">Dokumen</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pengajuan.data.length > 0 ? (
                                    pengajuan.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{item.user?.name}</p>
                                                <p className="text-[11px] text-slate-400 font-mono">NIP: {item.user?.nip || '-'}</p>
                                                <p className="text-[11px] text-slate-500">{item.user?.unit_kerja || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700 capitalize whitespace-nowrap">
                                                {item.jenis_izin.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                                                {item.tanggal_mulai} s/d {item.tanggal_selesai}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">{item.keterangan}</td>
                                            <td className="px-6 py-4 text-xs whitespace-nowrap">
                                                {item.lampiran ? (
                                                    <a
                                                        href={`/storage/${item.lampiran}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[#F28C28] hover:bg-orange-100 border border-orange-200/60 font-bold transition"
                                                    >
                                                        <Paperclip className="w-3.5 h-3.5" /> Buka Lampiran
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Tanpa Dokumen</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                {item.status === 'menunggu' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openActionModal(item, 'disetujui')}
                                                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => openActionModal(item, 'ditolak')}
                                                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-right">
                                                        <p className="text-[11px] text-slate-400">Diproses oleh</p>
                                                        <p className="text-xs font-semibold text-slate-700">{item.approver?.name || 'Admin'}</p>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            Tidak ada permohonan izin dengan status yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Action Approval (Responsive bottom-sheet on mobile, centered on desktop) */}
                {isActionModalOpen && selectedIzin && (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                                <h3 className="font-bold text-base text-[#0F2747]">
                                    {actionType === 'disetujui' ? 'Setujui Permohonan Izin' : 'Tolak Permohonan Izin'}
                                </h3>
                                <button
                                    onClick={() => setIsActionModalOpen(false)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleActionSubmit} className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                                    <p><strong>Pegawai:</strong> {selectedIzin.user?.name}</p>
                                    <p><strong>Jenis:</strong> {selectedIzin.jenis_izin.replace('_', ' ')}</p>
                                    <p><strong>Periode:</strong> {selectedIzin.tanggal_mulai} s/d {selectedIzin.tanggal_selesai}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                        Catatan Admin / Alasan Keputusan
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.data.catatan_admin}
                                        onChange={(e) => form.setData('catatan_admin', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20"
                                        placeholder="Tuliskan catatan persetujuan atau alasan penolakan..."
                                    />
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsActionModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow ${
                                            actionType === 'disetujui' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                        }`}
                                    >
                                        {form.processing ? 'Menyimpan...' : `Konfirmasi ${actionType === 'disetujui' ? 'Setujui' : 'Tolak'}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

