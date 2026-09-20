import { useEffect, FormEvent, ChangeEvent, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail, ArrowRight, ShieldCheck, MapPin, Sparkles, CheckCircle2, Clock, Award, Building2 } from 'lucide-react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const onHandleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setData(target.name as 'email' | 'password' | 'remember', value as any);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    const fillQuickAccount = (email: string) => {
        setData((prev) => ({
            ...prev,
            email: email,
            password: 'password',
        }));
    };

    const bgImageUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=85&w=2070&auto=format&fit=crop";

    return (
        <>
            <Head title="Masuk - SiAbsen STKIP USMAN SAFRI" />

            <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans selection:bg-[#F28C28] selection:text-white bg-slate-900">
                
                {/* 1. LEFT HERO BRANDING SECTION (Desktop 55% - 60% Width, Full Height) */}
                <div className="relative hidden lg:flex lg:w-7/12 xl:w-3/5 flex-col justify-between p-12 xl:p-16 overflow-hidden text-white">
                    {/* HD Background Image with Layered Blends */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter brightness-[0.95] contrast-[1.05]"
                        style={{ backgroundImage: `url('${bgImageUrl}')` }}
                    />
                    
                    {/* Deep University Brand Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#08172c]/95 via-[#0F2747]/90 to-[#0F2747]/70 backdrop-blur-[2px]" />
                    
                    {/* Futuristic Grid / Dot Accent */}
                    <div
                        className="absolute inset-0 opacity-[0.12] pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                            backgroundSize: '28px 28px'
                        }}
                    />

                    {/* Ambient Glows */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F28C28]/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Branding */}
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/20">
                            <img
                                src="/logo.webp"
                                alt="Logo STKIP Usman Safri"
                                className="h-12 w-auto max-w-[180px] object-contain"
                            />
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F28C28]/20 text-[#F28C28] border border-[#F28C28]/30">
                                <Sparkles className="w-3 h-3" /> Kampus Berkarakter & Unggul
                            </span>
                            <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                                STKIP USMAN SAFRI
                            </h2>
                        </div>
                    </div>

                    {/* Middle Core Feature Showcase */}
                    <div className="relative z-10 my-auto py-12 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-300 mb-6">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            Sistem Presensi Fungsional & Geofencing Presisi
                        </div>
                        
                        <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
                            Tertib, Akurat, & Terintegrasi Digital.
                        </h1>
                        <p className="text-slate-300 text-sm xl:text-base leading-relaxed mb-8 font-normal">
                            Platform presensi resmi dosen & tenaga kependidikan STKIP Usman Safri Kutacane berbasis geolokasi real-time dan verifikasi biometrik terpercaya.
                        </p>

                        {/* Feature Badges Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 hover:bg-white/[0.12] transition-colors">
                                <div className="p-2 rounded-xl bg-[#F28C28]/20 text-[#F28C28] border border-[#F28C28]/30">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-white">Geofence Radius</h4>
                                    <p className="text-[11px] text-slate-300">Validasi jarak presisi di area resmi kampus.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 hover:bg-white/[0.12] transition-colors">
                                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-white">Sinkronisasi WIB</h4>
                                    <p className="text-[11px] text-slate-300">Deteksi keterlambatan & jam kerja otomatis.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Accreditation & Footer */}
                    <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span>Kutacane, Aceh Tenggara, Indonesia</span>
                        </div>
                        <div>
                            <span>&copy; {new Date().getFullYear()} STKIP Usman Safri</span>
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT LOGIN FORM SECTION (Full width on Mobile, 45% - 40% on Desktop) */}
                <div className="w-full lg:w-5/12 xl:w-2/5 min-h-screen flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-slate-50 relative">
                    
                    {/* Subtle mobile background header for context */}
                    <div className="lg:hidden w-full flex flex-col items-center mb-6 text-center">
                        <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 mb-3">
                            <img
                                src="/logo.webp"
                                alt="Logo STKIP Usman Safri"
                                className="h-12 w-auto max-w-[170px] object-contain"
                            />
                        </div>
                        <span className="inline-block px-3 py-0.5 bg-[#F28C28]/10 text-[#F28C28] rounded-full text-[10px] font-bold tracking-wider uppercase mb-1">
                            Portal Presensi Resmi
                        </span>
                        <h2 className="text-lg font-black text-[#0F2747]">
                            STKIP USMAN SAFRI
                        </h2>
                    </div>

                    <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_15px_40px_-15px_rgba(15,39,71,0.12)] border border-slate-200/80">
                        
                        {/* Title header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-black tracking-tight text-[#0F2747]">
                                Selamat Datang 👋
                            </h2>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                                Masukkan email atau akun terdaftar Anda untuk melakukan presensi.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-emerald-700 shadow-sm flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Quick Demo Access Bar */}
                        <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    Pilih Akun Cepat (Demo)
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono">pwd: password</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => fillQuickAccount('admin@stkip-us.ac.id')}
                                    className="px-2 py-2 rounded-xl bg-white border border-slate-200 hover:border-red-400 hover:bg-red-50/60 text-center transition-all shadow-sm group"
                                >
                                    <span className="block text-[11px] font-bold text-red-600 group-hover:scale-105 transition-transform">Admin</span>
                                    <span className="block text-[9px] text-slate-400 truncate">admin@</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillQuickAccount('dosen@stkip-us.ac.id')}
                                    className="px-2 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 text-center transition-all shadow-sm group"
                                >
                                    <span className="block text-[11px] font-bold text-[#0F2747] group-hover:scale-105 transition-transform">Dosen</span>
                                    <span className="block text-[9px] text-slate-400 truncate">dosen@</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillQuickAccount('pegawai@stkip-us.ac.id')}
                                    className="px-2 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/60 text-center transition-all shadow-sm group"
                                >
                                    <span className="block text-[11px] font-bold text-emerald-600 group-hover:scale-105 transition-transform">Tendik</span>
                                    <span className="block text-[9px] text-slate-400 truncate">pegawai@</span>
                                </button>
                            </div>
                        </div>

                        {/* Form Login */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Input Email */}
                            <div>
                                <InputLabel forInput="email" value="Alamat Email / NIDN / NIP" className="text-slate-700 font-bold text-xs mb-1.5" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0F2747] focus:ring-2 focus:ring-[#0F2747]/15 rounded-xl text-xs sm:text-sm transition-all duration-200 py-3"
                                        placeholder="nama@stkip-us.ac.id"
                                        autoComplete="username"
                                        isFocused={true}
                                        handleChange={onHandleChange}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1.5 text-xs text-rose-600 font-medium" />
                            </div>

                            {/* Input Password */}
                            <div>
                                <InputLabel forInput="password" value="Kata Sandi" className="text-slate-700 font-bold text-xs mb-1.5" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="pl-10 w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0F2747] focus:ring-2 focus:ring-[#0F2747]/15 rounded-xl text-xs sm:text-sm transition-all duration-200 py-3"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        handleChange={onHandleChange}
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1.5 text-xs text-rose-600 font-medium" />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center cursor-pointer select-none group">
                                    <Checkbox
                                        name="remember"
                                        value={data.remember}
                                        handleChange={onHandleChange}
                                        className="w-4 h-4 rounded border-slate-300 text-[#0F2747] focus:ring-[#0F2747]/30 bg-white"
                                    />
                                    <span className="ml-2 text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                                        Ingat sesi saya
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 px-4 bg-[#0F2747] hover:bg-[#1a385e] active:bg-[#08172c] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#0F2747]/20 hover:shadow-[#0F2747]/35 focus:outline-none focus:ring-2 focus:ring-[#F28C28] focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 cursor-pointer"
                                >
                                    <span>{processing ? 'Memproses Masuk...' : 'Masuk ke Portal'}</span>
                                    <ArrowRight className="w-4 h-4 text-[#F28C28] group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>

                        {/* Footer Info Mobile */}
                        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col items-center gap-1 text-center">
                            <p className="text-[11px] font-semibold text-slate-400">
                                &copy; {new Date().getFullYear()} STKIP USMAN SAFRI KUTACANE
                            </p>
                            <p className="text-[10px] text-slate-400">
                                Sistem Absensi & Presensi Fungsional Terpadu
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
