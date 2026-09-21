import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import logoImg from '@/assets/logo.webp';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!authLoading && isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Gagal masuk ke sistem. Silakan periksa kembali email dan password.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Top Brand Banner */}
        <div className="bg-[#172554] px-6 py-8 text-center text-white relative">
          <div className="mx-auto h-16 w-16 rounded-xl bg-white/10 p-2 shadow-inner flex items-center justify-center mb-3">
            <img src={logoImg} alt="STKIP Usman Safri Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight uppercase">STKIP USMAN SAFRI</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            Sistem Absensi Fungsional Dosen & Tendik
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-orange-200 border border-primary/30 text-[11px] font-semibold mt-3">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Portal Administrator</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span className="flex-1 font-medium">{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@stkip-us.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-orange-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Otentikasi...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
