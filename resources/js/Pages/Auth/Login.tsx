import { useEffect, FormEvent, ChangeEvent, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Award } from 'lucide-react';

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
            password: 'password123',
        }));
    };

    // Ultra-crisp modern university architecture background
    const bgImageUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=85&w=2070&auto=format&fit=crop";

    return (
        <>
            <Head title="Masuk - SiAbsen STKIP USMAN SAFRI" />

            {/* 1 Layar Penuh di Desktop & Responsive di Mobile */}
            <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-900 font-sans selection:bg-[#F28C28] selection:text-white py-10 px-4 sm:px-6 lg:px-8">
                {/* 1. HD Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter brightness-[0.98] contrast-[1.05]"
                    style={{ backgroundImage: `url('${bgImageUrl}')` }}
                />

                {/* 2. Frosted Multi-Stop Gradient Layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-[#0F2747]/80 to-slate-900/65 backdrop-blur-[4px]" />

                {/* 3. Subtle Blueprint / Dot Matrix */}
                <div
                    className="absolute inset-0 opacity-[0.12] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* 4. Ambient Vibrant Glow Spheres */}
                <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-[#F28C28]/25 rounded-full blur-[100px] pointer-events-none animate-pulse duration-10000" />
                <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-[#0F2747]/60 rounded-full blur-[110px] pointer-events-none" />

                {/* Main Card Container */}
                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,39,71,0.35)] p-6 sm:p-8 transition-all duration-300">

                        {/* Header & Logo */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="relative mb-2 flex items-center justify-center">
                                <img
                                    src="/logo.webp"
                                    alt="Logo STKIP Usman Safri"
                                    className="h-16 w-auto max-w-[200px] object-contain hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            <div className="inline-block px-3 py-0.5 bg-[#F28C28]/10 text-[#F28C28] rounded-full text-[10px] font-bold tracking-wider uppercase mb-1.5">
                                Portal Presensi Resmi
                            </div>

                            <h1 className="text-xl font-extrabold tracking-tight text-[#0F2747]">
                                ABSENSI FUNGSIONAL
                            </h1>
                            <p className="text-xs font-semibold tracking-wide text-slate-600">
                                STKIP USMAN SAFRI KUTACANE
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-emerald-700 shadow-sm">
                                {status}
                            </div>
                        )}

                        {/* Quick Account Selector Demo Buttons */}
                        <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
                                Klik untuk Isi Akun Demo Cepat
                            </p>
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => fillQuickAccount('admin@stkipusmansafri.ac.id')}
                                    className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/50 text-[11px] font-bold text-slate-700 transition flex flex-col items-center gap-0.5"
                                >
                                    <span className="text-red-600 text-[10px]">Admin</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillQuickAccount('pimpinan@stkipusmansafri.ac.id')}
                                    className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-[11px] font-bold text-slate-700 transition flex flex-col items-center gap-0.5"
                                >
                                    <span className="text-purple-600 text-[10px]">Pimpinan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillQuickAccount('dosen@stkipusmansafri.ac.id')}
                                    className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-bold text-slate-700 transition flex flex-col items-center gap-0.5"
                                >
                                    <span className="text-[#0F2747] text-[10px]">Dosen/Tendik</span>
                                </button>
                            </div>
                        </div>

                        {/* Form Login */}
                        <form onSubmit={submit} className="space-y-3.5">
                            {/* Input Email */}
                            <div>
                                <InputLabel forInput="email" value="Alamat Email / NIP" className="text-[#0F2747] font-semibold text-xs mb-1" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0F2747] focus:ring-2 focus:ring-[#0F2747]/15 rounded-xl text-xs sm:text-sm transition-all duration-200 py-2.5"
                                        placeholder="nama@stkipusmansafri.ac.id"
                                        autoComplete="username"
                                        isFocused={true}
                                        handleChange={onHandleChange}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1 text-xs text-rose-600 font-medium" />
                            </div>

                            {/* Input Password */}
                            <div>
                                <InputLabel forInput="password" value="Kata Sandi" className="text-[#0F2747] font-semibold text-xs mb-1" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="pl-10 w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0F2747] focus:ring-2 focus:ring-[#0F2747]/15 rounded-xl text-xs sm:text-sm transition-all duration-200 py-2.5"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        handleChange={onHandleChange}
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1 text-xs text-rose-600 font-medium" />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-0.5">
                                <label className="flex items-center cursor-pointer select-none group">
                                    <Checkbox
                                        name="remember"
                                        value={data.remember}
                                        handleChange={onHandleChange}
                                        className="w-4 h-4 rounded border-slate-300 text-[#0F2747] focus:ring-[#0F2747]/30 bg-white"
                                    />
                                    <span className="ml-2 text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                                        Ingat sesi saya
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-1.5">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 sm:py-3 px-4 bg-[#0F2747] hover:bg-[#1c3656] active:bg-[#08172c] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#0F2747]/25 hover:shadow-[#0F2747]/35 focus:outline-none focus:ring-2 focus:ring-[#F28C28] focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 cursor-pointer"
                                >
                                    <span>{processing ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
                                    <ArrowRight className="w-4 h-4 text-[#F28C28] group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>

                        {/* Footer Info */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-0.5 text-center">
                            <p className="text-[11px] font-medium text-slate-400">
                                &copy; {new Date().getFullYear()} STKIP USMAN SAFRI
                            </p>
                            <p className="text-[10px] text-slate-400">
                                Sistem Informasi Presensi & Kehadiran Fungsional
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
