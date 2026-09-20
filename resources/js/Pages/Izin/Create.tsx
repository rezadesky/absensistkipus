import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    FilePlus2, 
    ArrowLeft, 
    Upload, 
    AlertCircle, 
    CheckCircle2,
    Calendar,
    Paperclip,
    FileText,
    X,
    Clock,
    ShieldAlert
} from 'lucide-react';

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function IzinCreate({ auth }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);

    const { data, setData, post, processing, errors } = useForm({
        jenis_izin: 'sakit',
        tanggal_mulai: '',
        tanggal_selesai: '',
        keterangan: '',
        lampiran: null as File | null,
    });

    // Hitung total hari
    const calculateDays = () => {
        if (!data.tanggal_mulai || !data.tanggal_selesai) return null;
        const start = new Date(data.tanggal_mulai);
        const end = new Date(data.tanggal_selesai);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const totalDays = calculateDays();

    const handleFileChange = (file: File | null) => {
        if (file) {
            setData('lampiran', file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        } else {
            setData('lampiran', null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('izin.store'));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('izin.index')}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-[#0F2747] tracking-tight">
                            Formulir Permohonan Izin / Cuti
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500">
                            Lengkapi data dan lampirkan dokumen surat resmi pendukung
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Pengajuan Izin Baru - STKIP Usman Safri" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Jenis Izin */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                                Jenis Permohonan <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { value: 'sakit', label: 'Izin Sakit', desc: 'Wajib lampirkan surat dokter' },
                                    { value: 'dinas_luar', label: 'Tugas / Dinas Luar', desc: 'Surat tugas kampus STKIP' },
                                    { value: 'cuti_tahunan', label: 'Cuti Tahunan', desc: 'Permohonan hak cuti kerja' },
                                    { value: 'keperluan_pribadi', label: 'Keperluan Pribadi', desc: 'Urusan keluarga mendesak' },
                                ].map((item) => (
                                    <label
                                        key={item.value}
                                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                                            data.jenis_izin === item.value
                                                ? 'border-[#F28C28] bg-orange-50/50 shadow-xs'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="jenis_izin"
                                            value={item.value}
                                            checked={data.jenis_izin === item.value}
                                            onChange={(e) => setData('jenis_izin', e.target.value as any)}
                                            className="mt-0.5 text-[#F28C28] focus:ring-[#F28C28]"
                                        />
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800">{item.label}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.jenis_izin && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.jenis_izin}</p>}
                        </div>

                        {/* Tanggal Mulai & Selesai */}
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                                        Tanggal Mulai <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={data.tanggal_mulai}
                                            onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                            className="w-full text-xs font-medium rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 py-2.5"
                                            required
                                        />
                                    </div>
                                    {errors.tanggal_mulai && <p className="text-xs text-rose-500 mt-1">{errors.tanggal_mulai}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                                        Tanggal Selesai <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={data.tanggal_selesai}
                                            min={data.tanggal_mulai}
                                            onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                            className="w-full text-xs font-medium rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 py-2.5"
                                            required
                                        />
                                    </div>
                                    {errors.tanggal_selesai && <p className="text-xs text-rose-500 mt-1">{errors.tanggal_selesai}</p>}
                                </div>
                            </div>

                            {totalDays !== null && (
                                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200/60 text-[#F28C28] text-xs font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Durasi Permohonan: {totalDays} Hari</span>
                                </div>
                            )}
                        </div>

                        {/* Alasan / Keterangan */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                                Alasan / Keterangan Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                placeholder="Tuliskan keterangan detail alasan ketidakhadiran kerja..."
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 p-3"
                                required
                            />
                            {errors.keterangan && <p className="text-xs text-rose-500 mt-1">{errors.keterangan}</p>}
                        </div>

                        {/* Upload Lampiran Dokumen */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                                Lampiran Dokumen Surat (PDF / Foto / Bukti)
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                className="hidden"
                            />

                            {!data.lampiran ? (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                                        dragActive
                                            ? 'border-[#F28C28] bg-orange-50/60'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                                    }`}
                                >
                                    <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 text-[#F28C28] flex items-center justify-center mb-2">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-700">
                                        Klik untuk memilih file <span className="font-normal text-slate-500">atau seret file ke sini</span>
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Format: PDF, JPG, PNG, WEBP (Maksimal 10 MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F28C28] flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {data.lampiran.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-mono">
                                                {formatFileSize(data.lampiran.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleFileChange(null)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                        title="Hapus file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {previewUrl && (
                                <div className="mt-3">
                                    <p className="text-[11px] font-bold text-slate-500 mb-1">Pratinjau Foto:</p>
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview Dokumen" 
                                        className="h-36 w-auto object-cover rounded-xl border border-slate-200" 
                                    />
                                </div>
                            )}

                            {errors.lampiran && <p className="text-xs text-rose-500 mt-1">{errors.lampiran}</p>}
                        </div>

                        {/* Buttons */}
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <Link
                                href={route('izin.index')}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl bg-[#0F2747] hover:bg-[#163863] active:scale-[0.98] text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                            >
                                {processing ? 'Mengirim Permohonan...' : 'Kirim Permohonan Izin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
