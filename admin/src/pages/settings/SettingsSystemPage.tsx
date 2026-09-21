import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Server } from 'lucide-react';

export const SettingsSystemPage: React.FC = () => {
  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Pengaturan Sistem"
        subtitle="Parameter sistem, informasi institusi, dan konfigurasi server."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-border shadow-xs bg-white">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle className="text-sm font-bold text-secondary flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Identitas Institusi</span>
            </CardTitle>
            <CardDescription className="text-xs">STKIP Usman Safri</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-700 space-y-2">
            <p><strong>Nama Aplikasi:</strong> Sistem Absensi Fungsional Dosen & Tendik</p>
            <p><strong>Zona Waktu:</strong> Asia/Jakarta (WIB)</p>
            <p><strong>Target Environment:</strong> Laravel 9 REST API + React Admin</p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-white">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle className="text-sm font-bold text-secondary flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-600" />
              <span>Status Koneksi API</span>
            </CardTitle>
            <CardDescription className="text-xs">Konfigurasi endpoint backend</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-700 space-y-2">
            <p><strong>Base URL:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">{import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</code></p>
            <p><strong>Autentikasi:</strong> Laravel Sanctum Bearer Token</p>
            <p><strong>Database Engine:</strong> MySQL</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
