import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { settingsApi } from '@/api/settings';
import type { WorkDayConfig } from '@/types';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const SettingsWorkDaysPage: React.FC = () => {
  const [workDays, setWorkDays] = useState<WorkDayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchWorkDays = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsApi.getWorkDays();
      if (res.success && res.data) {
        setWorkDays(res.data);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat pengaturan hari kerja.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkDays();
  }, [fetchWorkDays]);

  const handleToggle = (id: number) => {
    setWorkDays((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const payload = workDays.map((d) => ({ id: d.id, is_active: d.is_active }));
      await settingsApi.updateWorkDays(payload);
      setFeedback({ type: 'success', message: 'Pengaturan hari kerja berhasil disimpan.' });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memperbarui pengaturan hari kerja.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Pengaturan Hari Kerja"
        subtitle="Konfigurasi hari aktif kerja institusi untuk validasi absensi harian."
      >
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="bg-primary hover:bg-orange-600 text-white text-xs h-9 cursor-pointer"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </PageHeader>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-semibold underline">
            Tutup
          </button>
        </div>
      )}

      <Card className="border border-border shadow-xs bg-white">
        <CardHeader className="p-4 sm:p-5">
          <CardTitle className="text-base font-bold text-secondary flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Jadwal Hari Kerja Aktif</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Pegawai hanya diizinkan melakukan presensi pada hari yang diaktifkan di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {isLoading ? (
            <div className="py-8 text-center flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Memuat data...</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {workDays.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 capitalize">
                      {item.day}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {item.is_active ? 'Hari Kerja Wajib Presensi' : 'Hari Libur / Non-Aktif'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_active}
                      onChange={() => handleToggle(item.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
