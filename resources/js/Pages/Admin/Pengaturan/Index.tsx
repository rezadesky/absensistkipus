import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Settings, 
    MapPin, 
    Clock, 
    Save, 
    CheckCircle2, 
    ShieldCheck, 
    AlertCircle 
} from 'lucide-react';

interface Pengaturan {
    id: number;
    nama_instansi: string;
    latitude: number;
    longitude: number;
    radius_meter: number;
    jam_masuk: string;
    toleransi_keterlambatan_menit: number;
    jam_pulang: string;
    wajib_foto: boolean;
}

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    pengaturan: Pengaturan;
}

export default function AdminPengaturanIndex({ auth, pengaturan }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nama_instansi: pengaturan.nama_instansi,
        latitude: pengaturan.latitude,
        longitude: pengaturan.longitude,
        radius_meter: pengaturan.radius_meter,
        jam_masuk: pengaturan.jam_masuk,
        toleransi_keterlambatan_menit: pengaturan.toleransi_keterlambatan_menit,
        jam_pulang: pengaturan.jam_pulang,
        wajib_foto: pengaturan.wajib_foto,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.pengaturan.update'));
    };

    return (
        <AuthenticatedLayout
            auth={auth as any}
            header={
                <div>
                    <h2 className="text-xl font-bold text-[#0F2747]">Pengaturan Geofencing & Jadwal Kerja</h2>
                    <p className="text-xs text-slate-500">Konfigurasi koordinat GPS kampus, radius absensi, dan jam kerja fungsional</p>
                </div>
            }
        >
            <Head title="Pengaturan Geofencing - Admin SiAbsen" />

            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {recentlySuccessful && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>Pengaturan sistem dan koordinat geofencing berhasil diperbarui!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Geofencing Coordinates */}
                    <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <div className="p-2 rounded-xl bg-orange-100 text-[#F28C28] flex-shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-[#0F2747]">Titik Koordinat & Radius Geofencing Kampus</h3>
                                <p className="text-xs text-slate-500">Menentukan batas virtual absensi presensi pegawai</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-2xl">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Kalibrasi GPS Otomatis</p>
                                <p className="text-[11px] text-slate-500">Ambil titik koordinat presisi langsung dari lokasi perangkat Anda saat ini di kampus</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                setData((prev) => ({
                                                    ...prev,
                                                    latitude: pos.coords.latitude,
                                                    longitude: pos.coords.longitude,
                                                }));
                                                alert(`Koordinat berhasil diambil!\nLat: ${pos.coords.latitude}\nLng: ${pos.coords.longitude}\nAkurasi: ±${Math.round(pos.coords.accuracy)} meter`);
                                            },
                                            (err) => alert('Gagal mengambil GPS: ' + err.message),
                                            { enableHighAccuracy: true }
                                        );
                                    } else {
                                        alert('Perangkat tidak mendukung geolocation.');
                                    }
                                }}
                                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white text-xs font-bold shadow-xs transition"
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Ambil Titik GPS Saya</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Nama Instansi / Kampus
                            </label>
                            <input
                                type="text"
                                value={data.nama_instansi}
                                onChange={(e) => setData('nama_instansi', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 font-medium py-2.5"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Latitude Kampus
                                </label>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={data.latitude}
                                    onChange={(e) => setData('latitude', parseFloat(e.target.value) || 0)}
                                    className="w-full text-xs rounded-xl border-slate-200 font-mono py-2.5"
                                    required
                                />
                                {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Longitude Kampus
                                </label>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={data.longitude}
                                    onChange={(e) => setData('longitude', parseFloat(e.target.value) || 0)}
                                    className="w-full text-xs rounded-xl border-slate-200 font-mono py-2.5"
                                    required
                                />
                                {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Radius Toleransi (Meter)
                                </label>
                                <input
                                    type="number"
                                    value={data.radius_meter}
                                    onChange={(e) => setData('radius_meter', parseInt(e.target.value) || 0)}
                                    className="w-full text-xs rounded-xl border-slate-200 font-bold py-2.5"
                                    required
                                />
                                {errors.radius_meter && <p className="text-xs text-red-500 mt-1">{errors.radius_meter}</p>}
                            </div>
                        </div>

                        {/* Preset Radius Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] text-slate-500 font-medium">Pilihan Cepat Radius:</span>
                            {[150, 200, 250, 300].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setData('radius_meter', r)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                        data.radius_meter === r
                                            ? 'bg-[#0F2747] text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {r} Meter
                                </button>
                            ))}
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
                            <p><strong>Catatan Geofencing:</strong> Pegawai yang melakukan presensi di luar radius {data.radius_meter} meter dari titik koordinat di atas akan otomatis ditolak oleh sistem.</p>
                            <p className="text-[11px] text-slate-400">Rekomendasi radius untuk area gedung, gerbang, dan parkiran STKIP: <strong>200 - 300 Meter</strong>.</p>
                        </div>
                    </div>

                    {/* Schedule & Timing */}
                    <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <div className="p-2 rounded-xl bg-blue-100 text-[#0F2747] flex-shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-[#0F2747]">Jadwal Jam Kerja & Toleransi</h3>
                                <p className="text-xs text-slate-500">Waktu masuk, batas toleransi terlambat, dan jam pulang</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Jam Masuk Kerja
                                </label>
                                <input
                                    type="time"
                                    step="1"
                                    value={data.jam_masuk}
                                    onChange={(e) => setData('jam_masuk', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 font-mono font-bold py-2.5"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Toleransi Terlambat (Menit)
                                </label>
                                <input
                                    type="number"
                                    value={data.toleransi_keterlambatan_menit}
                                    onChange={(e) => setData('toleransi_keterlambatan_menit', parseInt(e.target.value) || 0)}
                                    className="w-full text-xs rounded-xl border-slate-200 font-bold py-2.5"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Jam Pulang Kerja
                                </label>
                                <input
                                    type="time"
                                    step="1"
                                    value={data.jam_pulang}
                                    onChange={(e) => setData('jam_pulang', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 font-mono font-bold py-2.5"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0F2747] hover:bg-[#163863] active:scale-[0.99] text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4 text-[#F28C28]" />
                            <span>{processing ? 'Menyimpan Pengaturan...' : 'Simpan Perubahan Pengaturan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

