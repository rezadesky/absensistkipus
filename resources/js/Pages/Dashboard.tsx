import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    CalendarCheck, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ArrowRight, 
    MapPin, 
    FileText, 
    ShieldCheck, 
    TrendingUp,
    Calendar,
    ChevronRight,
    User,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';

interface PresensiData {
    id: number;
    tanggal: string;
    jam_masuk?: string;
    status: 'hadir' | 'terlambat' | 'izin' | 'cuti' | 'alpa';
    keterangan?: string;
}

interface PengajuanIzinItem {
    id: number;
    jenis_izin: 'sakit' | 'keperluan_pribadi' | 'dinas_luar' | 'cuti_tahunan';
    tanggal_mulai: string;
    tanggal_selesai: string;
    keterangan: string;
    lampiran?: string;
    status: 'menunggu' | 'disetujui' | 'ditolak';
    catatan_admin?: string;
    approver?: {
        name: string;
    };
    created_at: string;
}

interface StatsBulanIni {
    hadir: number;
    terlambat: number;
    izin: number;
    alpa: number;
    totalHadir: number;
}

interface Pengaturan {
    nama_instansi: string;
    latitude: number;
    longitude: number;
    radius_meter: number;
    jam_masuk: string;
    toleransi_keterlambatan_menit: number;
    jam_pulang: string;
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            nip?: string;
            role_type?: 'admin' | 'pimpinan' | 'dosen_tendik';
            jabatan?: string;
            unit_kerja?: string;
        };
    };
    presensiHariIni?: PresensiData | null;
    statsBulanIni: StatsBulanIni;
    riwayatTerbaru: PresensiData[];
    pengajuanIzinTerbaru?: PengajuanIzinItem[];
    izinAktifHariIni?: PengajuanIzinItem | null;
    pengaturan?: Pengaturan;
}

export default function Dashboard({ 
    auth, 
    presensiHariIni, 
    statsBulanIni, 
    riwayatTerbaru, 
    pengajuanIzinTerbaru = [], 
    izinAktifHariIni = null,
    pengaturan 
}: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [isWithinRadius, setIsWithinRadius] = useState<boolean>(false);
    const [isLocating, setIsLocating] = useState<boolean>(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [clientError, setClientError] = useState<string | null>(null);

    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

    const checkinForm = useForm({
        latitude: '',
        longitude: '',
        keterangan: '',
    });

    const campusLat = pengaturan?.latitude ?? 3.486250;
    const campusLng = pengaturan?.longitude ?? 97.809167;
    const maxRadius = pengaturan?.radius_meter ?? 200;
    const jamPulangString = pengaturan?.jam_pulang ? pengaturan.jam_pulang.substring(0, 5) : '16:00';

    // Cek Batas Waktu Presensi
    const checkIsTimeValid = (now: Date) => {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        const currentTotalSec = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

        const openTotalSec = 6 * 3600; // 06:00:00

        const parts = (pengaturan?.jam_pulang || '16:00:00').split(':').map(Number);
        const closeTotalSec = (parts[0] || 16) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);

        if (currentTotalSec < openTotalSec) {
            return { valid: false, status: 'too_early', reason: 'Waktu presensi belum dibuka (Buka mulai 06:00 WIB)' };
        }
        if (currentTotalSec > closeTotalSec) {
            return { valid: false, status: 'too_late', reason: `Waktu presensi hari ini telah berakhir (Batas: ${jamPulangString} WIB)` };
        }
        return { valid: true, status: 'active', reason: 'Waktu presensi aktif' };
    };

    const timeStatus = checkIsTimeValid(currentTime);
    const isAbsenAllowed = isWithinRadius && timeStatus.valid && !isLocating && userLocation !== null;

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    const getLocation = () => {
        setIsLocating(true);
        setLocationError(null);
        setClientError(null);

        if (!navigator.geolocation) {
            setLocationError('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
            setIsLocating(false);
            setUserLocation(null);
            setIsWithinRadius(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const acc = Math.round(position.coords.accuracy || 0);

                setUserLocation({ latitude: lat, longitude: lng });
                setGpsAccuracy(acc);

                const dist = calculateDistance(lat, lng, campusLat, campusLng);
                setDistance(dist);
                
                const within = dist <= maxRadius;
                setIsWithinRadius(within);

                checkinForm.setData((prev) => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                }));

                setIsLocating(false);
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                setUserLocation(null);
                setDistance(null);
                setGpsAccuracy(null);
                setIsWithinRadius(false);

                let errorMsg = 'Izin lokasi GPS tidak aktif / ditolak.';
                if (error.code === 1) {
                    errorMsg = 'Izin akses GPS ditolak. Harap izinkan akses lokasi di browser / HP Anda.';
                } else if (error.code === 2) {
                    errorMsg = 'Lokasi tidak dapat ditentukan. Pastikan GPS perangkat Anda aktif.';
                } else if (error.code === 3) {
                    errorMsg = 'Waktu permintaan GPS habis. Silakan coba tekan Refresh GPS kembali.';
                }

                setLocationError(errorMsg);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        getLocation();
        return () => clearInterval(timer);
    }, []);

    const handleCheckin = (e: React.FormEvent) => {
        e.preventDefault();
        setClientError(null);

        // Validasi Radius
        if (!isWithinRadius) {
            setClientError(`Absen Ditolak! Anda berada di luar radius lokasi kampus (${distance !== null ? distance : '0'}m dari kampus, batas maksimal ${maxRadius}m).`);
            return;
        }

        // Validasi Waktu
        if (!timeStatus.valid) {
            setClientError(`Absen Ditolak! ${timeStatus.reason}.`);
            return;
        }

        checkinForm.post(route('presensi.store'), {
            preserveScroll: true,
        });
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hadir':
                return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hadir Tepat Waktu</span>;
            case 'terlambat':
                return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Terlambat</span>;
            case 'izin':
            case 'cuti':
                return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Izin / Cuti</span>;
            default:
                return <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Alpa</span>;
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth as any}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#F28C28] shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-[#0F2747] tracking-tight truncate">
                                Selamat Datang, {auth.user.name}
                            </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                {auth.user.jabatan || 'Pegawai'}
                            </span>
                            {auth.user.unit_kerja && (
                                <span className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-none">
                                    • {auth.user.unit_kerja}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center sm:justify-end self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100/80 text-slate-700 text-[11px] sm:text-xs font-semibold border border-slate-200/60">
                            <Calendar className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
                            <span>{formatDate(currentTime)}</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Presensi - STKIP Usman Safri" />

            <div className="space-y-5 sm:space-y-6">
                {/* Active Approved Leave Today Banner */}
                {izinAktifHariIni && (
                    <div className="bg-gradient-to-r from-blue-900 to-[#0F2747] rounded-2xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-blue-400/30 shadow-md animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                        Izin Aktif Disetujui
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold capitalize">
                                        {izinAktifHariIni.jenis_izin.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                                    Periode: {izinAktifHariIni.tanggal_mulai} s/d {izinAktifHariIni.tanggal_selesai} • Catatan: "{izinAktifHariIni.keterangan}"
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('izin.index')}
                            className="self-start sm:self-auto shrink-0 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/20 transition text-center"
                        >
                            Detail Izin
                        </Link>
                    </div>
                )}

                {/* Hero / Quick Check-In Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Status & Form Presensi Hari Ini */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-[#0F2747] via-[#133156] to-[#0a1a30] rounded-3xl p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10">
                        {/* Ambient glow effects */}
                        <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-80 h-80 bg-[#F28C28]/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute left-0 bottom-0 -translate-x-1/4 translate-y-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Card Header: Badge & Live Digital Clock */}
                        <div className="flex items-center justify-between gap-3 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-md border border-white/15 shadow-inner">
                                <span className={`w-2 h-2 rounded-full ${isAbsenAllowed ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-ping'}`} />
                                <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
                                <span>Presensi Hari Ini</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">WIB</span>
                                <div className="font-mono text-2xl sm:text-3xl font-black text-[#F28C28] tracking-wider drop-shadow-sm">
                                    {currentTime.toLocaleTimeString('id-ID')}
                                </div>
                            </div>
                        </div>

                        {/* Card Body: Circular Animated Button or Checked-in Seal */}
                        <div className="py-6 sm:py-8 flex flex-col items-center justify-center relative z-10">
                            {presensiHariIni ? (
                                /* State: Sudah Melakukan Presensi Hari Ini */
                                <div className="flex flex-col items-center text-center space-y-4 max-w-md w-full">
                                    {/* Success Animated Circle Seal */}
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-2xl flex items-center justify-center">
                                            <div className="w-full h-full rounded-full bg-[#0F2747]/90 backdrop-blur flex flex-col items-center justify-center text-emerald-400 p-2 border border-emerald-400/30">
                                                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 drop-shadow animate-bounce" />
                                                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 mt-1">
                                                    Tercatat
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info details */}
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 w-full space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-300">Status Kehadiran</span>
                                            <div>{getStatusBadge(presensiHariIni.status)}</div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                            <span className="text-xs text-slate-300">Waktu Masuk</span>
                                            <span className="text-sm sm:text-base font-extrabold font-mono text-white">
                                                {presensiHariIni.jam_masuk || '--:--:--'} WIB
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* State: Belum Absen -> Circular Interactive Button */
                                <form onSubmit={handleCheckin} className="flex flex-col items-center text-center w-full">
                                    {/* Location Error / GPS Permission Denied Banner */}
                                    {locationError && (
                                        <div className="mb-4 max-w-md w-full p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur text-amber-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span className="flex-1 text-left">{locationError}</span>
                                        </div>
                                    )}

                                    {/* Client Error Rejection Alert Box */}
                                    {clientError && (
                                        <div className="mb-4 max-w-md w-full p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 backdrop-blur text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                            <span className="flex-1 text-left">{clientError}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => setClientError(null)}
                                                className="text-white hover:text-rose-300 p-1 font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    {/* Animated Radar Circle Button */}
                                    <div className="relative my-2 sm:my-3 group">
                                        {/* Outer pulsing radar waves (Green/Orange/Rose based on validity) */}
                                        <div className={`absolute -inset-4 sm:-inset-6 rounded-full pointer-events-none opacity-75 ${
                                            isAbsenAllowed 
                                                ? 'bg-[#F28C28]/20 animate-ping' 
                                                : 'bg-rose-500/20 animate-pulse'
                                        }`} />
                                        <div className={`absolute -inset-2 sm:-inset-3 rounded-full pointer-events-none ${
                                            isAbsenAllowed
                                                ? 'bg-gradient-to-r from-[#F28C28]/40 to-amber-500/30 animate-pulse'
                                                : 'bg-rose-500/30'
                                        }`} />

                                        {/* Main Circular Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={checkinForm.processing || isLocating || !userLocation}
                                            className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 transition-all duration-300 flex items-center justify-center group cursor-pointer focus:outline-none ${
                                                isAbsenAllowed
                                                    ? 'bg-gradient-to-tr from-[#e07010] via-[#F28C28] to-[#fb923c] shadow-[0_0_40px_rgba(242,140,40,0.45)] hover:shadow-[0_0_55px_rgba(242,140,40,0.65)] hover:scale-105 active:scale-95'
                                                    : 'bg-gradient-to-tr from-slate-700 via-rose-900 to-rose-700 shadow-[0_0_30px_rgba(225,29,72,0.35)] hover:scale-[1.02] active:scale-95'
                                            } disabled:opacity-60`}
                                        >
                                            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0F2747]/40 to-[#0F2747]/90 backdrop-blur-sm border-2 border-white/30 flex flex-col items-center justify-center p-3 text-white transition duration-300 group-hover:bg-transparent">
                                                <div className={`p-2 sm:p-2.5 rounded-full backdrop-blur transition-all duration-300 mb-1.5 sm:mb-2 shadow-md ${
                                                    isAbsenAllowed 
                                                        ? 'bg-white/20 group-hover:bg-white text-white group-hover:text-[#F28C28]' 
                                                        : 'bg-rose-500/30 text-rose-300'
                                                }`}>
                                                    {isAbsenAllowed ? (
                                                        <CalendarCheck className="w-6 h-6 sm:w-8 sm:h-8" />
                                                    ) : (
                                                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400" />
                                                    )}
                                                </div>
                                                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white drop-shadow leading-tight">
                                                    {checkinForm.processing ? 'Menyimpan...' : isAbsenAllowed ? 'Tap Absen' : 'Absen Ditolak'}
                                                </span>
                                                <span className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 tracking-tight ${
                                                    isAbsenAllowed ? 'text-orange-200 group-hover:text-white' : 'text-rose-300'
                                                }`}>
                                                    {isLocating 
                                                        ? 'Mencari GPS...' 
                                                        : !userLocation
                                                            ? 'GPS Tidak Aktif'
                                                            : !isWithinRadius 
                                                                ? 'Di Luar Radius' 
                                                                : !timeStatus.valid 
                                                                    ? 'Di Luar Jam' 
                                                                    : 'Masuk Kerja'}
                                                </span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* GPS Live Distance & Campus Tag */}
                                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur border text-xs font-medium ${
                                            isWithinRadius
                                                ? 'bg-white/10 border-white/15 text-slate-200'
                                                : 'bg-rose-500/20 border-rose-500/30 text-rose-200'
                                        }`}>
                                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isWithinRadius ? 'text-[#F28C28]' : 'text-rose-400'}`} />
                                            <span>
                                                {isLocating ? 'Mendeteksi GPS...' : distance !== null ? `Jarak: ${distance} Meter` : 'GPS Belum Terkunci'}
                                            </span>
                                            {gpsAccuracy !== null && (
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                                                    gpsAccuracy <= 20 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-200'
                                                }`}>
                                                    ±{gpsAccuracy}m
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={getLocation}
                                            disabled={isLocating}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[11px] text-slate-200 border border-white/15 transition cursor-pointer"
                                            title="Perbarui titik koordinat GPS"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 text-[#F28C28] ${isLocating ? 'animate-spin' : ''}`} />
                                            <span>Refresh GPS</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Card Footer: Schedule Info & Radius Indicator */}
                        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-300 relative z-10">
                            <div className="flex items-center gap-1.5 text-slate-300">
                                <Clock className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
                                <span>
                                    Jadwal: {pengaturan?.jam_masuk ? pengaturan.jam_masuk.substring(0, 5) : '08:00'} - {jamPulangString} WIB
                                    {!timeStatus.valid && <span className="text-rose-400 font-bold ml-1">({timeStatus.reason})</span>}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 font-medium">
                                <span>Maks. Radius: {maxRadius}m</span>
                                <span>•</span>
                                <span className={isWithinRadius ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-rose-400 font-bold flex items-center gap-1'}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isWithinRadius ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'}`} />
                                    {isLocating ? 'Mendeteksi...' : isWithinRadius ? 'Dalam Radius' : 'Luar Radius (Ditolak)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Action & Leave Status Card */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-extrabold text-sm sm:text-base text-[#0F2747] mb-1 tracking-tight">Aksi Cepat & Status Izin</h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 mb-3.5">
                                Akses cepat permohonan izin atau pantau status persetujuan.
                            </p>

                            <div className="space-y-2">
                                <Link
                                    href={route('izin.create')}
                                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-orange-50/60 hover:border-orange-200 transition group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-orange-100/80 text-[#F28C28]">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 group-hover:text-[#F28C28] transition">Ajukan Izin / Cuti</p>
                                            <p className="text-[10px] sm:text-[11px] text-slate-400">Sakit, Tugas Luar, atau Cuti</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#F28C28] transition" />
                                </Link>

                                <Link
                                    href={route('presensi.riwayat')}
                                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-blue-50/60 hover:border-blue-200 transition group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-blue-100/80 text-[#0F2747]">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 group-hover:text-[#0F2747] transition">Riwayat & Rekap Pribadi</p>
                                            <p className="text-[10px] sm:text-[11px] text-slate-400">Unduh PDF / Rekap Presensi</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2747] transition" />
                                </Link>
                            </div>

                            {/* Status Pengajuan Izin Terbaru */}
                            {pengajuanIzinTerbaru.length > 0 && (
                                <div className="mt-4 pt-3.5 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                            Status Izin Terbaru
                                        </span>
                                        <Link
                                            href={route('izin.index')}
                                            className="text-[11px] font-bold text-[#F28C28] hover:underline"
                                        >
                                            Lihat Semua
                                        </Link>
                                    </div>
                                    <div className="space-y-2">
                                        {pengajuanIzinTerbaru.map((izin) => (
                                            <div
                                                key={izin.id}
                                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 capitalize truncate text-xs">
                                                        {izin.jenis_izin.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {izin.tanggal_mulai} s/d {izin.tanggal_selesai}
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    {izin.status === 'disetujui' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                                            <CheckCircle2 className="w-3 h-3" /> Disetujui
                                                        </span>
                                                    )}
                                                    {izin.status === 'ditolak' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]" title={izin.catatan_admin || 'Ditolak'}>
                                                            <AlertCircle className="w-3 h-3" /> Ditolak
                                                        </span>
                                                    )}
                                                    {izin.status === 'menunggu' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                                                            <Clock className="w-3 h-3" /> Menunggu
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <p className="text-[10px] sm:text-[11px] text-slate-400 text-center font-medium">
                                STKIP Usman Safri • Sistem Absensi Fungsional
                            </p>
                        </div>
                    </div>
                </div>

                {/* Monthly Summary Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Tepat Waktu</span>
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1.5">{statsBulanIni.hadir}</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Hari bulan ini</p>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Terlambat</span>
                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1.5">{statsBulanIni.terlambat}</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Hari terlambat</p>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Izin / Cuti</span>
                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1.5">{statsBulanIni.izin}</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Hari permohonan</p>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Tanpa Ket.</span>
                            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1.5">{statsBulanIni.alpa}</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Hari alpa</p>
                    </div>
                </div>

                {/* Riwayat Terakhir - Responsive Card & Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-extrabold text-sm sm:text-base text-[#0F2747] tracking-tight">Riwayat Presensi Terbaru</h3>
                            <p className="text-[11px] sm:text-xs text-slate-500">7 aktivitas presensi terakhir Anda</p>
                        </div>
                        <Link
                            href={route('presensi.riwayat')}
                            className="text-xs font-bold text-[#F28C28] hover:text-[#0F2747] flex items-center gap-1 transition"
                        >
                            <span>Semua</span> <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Mobile Card List View (sm:hidden) */}
                    <div className="sm:hidden divide-y divide-slate-100">
                        {riwayatTerbaru.length > 0 ? (
                            riwayatTerbaru.map((item) => (
                                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-800">
                                            {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.tanggal))}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                            <span className="font-mono text-slate-700 font-semibold">{item.jam_masuk || '--:--'}</span>
                                            {item.keterangan && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[120px]">{item.keterangan}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-slate-400 text-xs">
                                Belum ada catatan riwayat presensi.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View (hidden sm:block) */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Jam Masuk</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {riwayatTerbaru.length > 0 ? (
                                    riwayatTerbaru.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-6 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                                                {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.tanggal))}
                                            </td>
                                            <td className="px-6 py-3.5 font-mono text-slate-700">{item.jam_masuk || '-'}</td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                                            <td className="px-6 py-3.5 text-xs text-slate-500">{item.keterangan || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                                            Belum ada catatan riwayat presensi.
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
