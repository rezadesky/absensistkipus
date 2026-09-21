import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { attendanceApi, type AttendanceSummaryResponse } from '@/api/attendance';
import { CheckCircle2, FileCheck, Users, Calendar, Loader2, AlertCircle } from 'lucide-react';

export const AttendanceRecapPage: React.FC = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getSummary({ month, year });
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat rekap absensi.');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Rekap Absensi"
        subtitle="Rekapitulasi dan ringkasan persentase kehadiran bulanan pegawai."
      />

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={fetchSummary} className="font-semibold underline cursor-pointer">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Month / Year Selector */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Periode Rekap:</span>
          </div>
          <select
            aria-label="Pilih Bulan Rekap"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {monthNames.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            aria-label="Pilih Tahun Rekap"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Menghitung rekapitulasi kehadiran...</span>
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-border shadow-xs bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Presensi Hadir</p>
                <h3 className="text-2xl font-bold text-secondary mt-0.5">{summary.total_hadir} kali</h3>
              </div>
            </div>
          </Card>

          <Card className="border border-border shadow-xs bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Izin / Tugas Luar</p>
                <h3 className="text-2xl font-bold text-secondary mt-0.5">{summary.total_izin} kali</h3>
              </div>
            </div>
          </Card>

          <Card className="border border-border shadow-xs bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Pegawai Terdaftar</p>
                <h3 className="text-2xl font-bold text-secondary mt-0.5">{summary.active_employees?.total || 0} orang</h3>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
