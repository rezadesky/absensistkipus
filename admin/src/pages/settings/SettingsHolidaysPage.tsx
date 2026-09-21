import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { settingsApi } from '@/api/settings';
import type { HolidayConfig } from '@/types';
import { CalendarOff, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SettingsHolidaysPage: React.FC = () => {
  const [holidays, setHolidays] = useState<HolidayConfig[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsApi.getHolidays(year);
      if (res.success && res.data) {
        setHolidays(res.data);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat kalender hari libur.' });
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await settingsApi.createHoliday(formData);
      setFeedback({ type: 'success', message: 'Hari libur berhasil ditambahkan.' });
      setIsCreateOpen(false);
      setFormData({ date: '', name: '', description: '' });
      fetchHolidays();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menambahkan hari libur.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tanggal libur ini?')) return;
    try {
      await settingsApi.deleteHoliday(id);
      setFeedback({ type: 'success', message: 'Hari libur berhasil dihapus.' });
      fetchHolidays();
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus hari libur.' });
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Pengaturan Hari Libur"
        subtitle="Daftar hari libur nasional dan cuti bersama institusi."
      >
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-orange-600 text-white gap-2 text-xs font-semibold h-9 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Hari Libur</span>
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

      {/* Year Selector Card */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Tahun Kalender:</span>
            <select
              aria-label="Pilih Tahun Kalender"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-8 px-2 rounded border border-slate-300 text-xs bg-white"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground">
            Total <strong>{holidays.length}</strong> hari libur terdaftar
          </span>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-base font-bold text-secondary flex items-center gap-2">
            <CalendarOff className="h-4 w-4 text-primary" />
            <span>Daftar Libur Tahun {year}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Tanggal Libur</TableHead>
                <TableHead className="w-[40%]">Nama Hari Libur</TableHead>
                <TableHead className="w-[30%]">Keterangan</TableHead>
                <TableHead className="w-[10%] text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                    <span>Memuat hari libur...</span>
                  </TableCell>
                </TableRow>
              ) : holidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                    Belum ada hari libur pada tahun ini.
                  </TableCell>
                </TableRow>
              ) : (
                holidays.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs font-medium text-slate-800">
                      {h.date}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-secondary">
                      {h.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {h.description || '-'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleDelete(h.id)}
                        title="Hapus Hari Libur"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Create Holiday */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-secondary">
              Tambah Hari Libur
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Masukkan tanggal dan nama hari libur nasional atau cuti bersama.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Libur *
              </label>
              <Input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Hari Libur *
              </label>
              <Input
                required
                placeholder="Contoh: Tahun Baru Hijriyah / Cuti Bersama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan Tambahan
              </label>
              <Input
                placeholder="Opsional"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-primary hover:bg-orange-600 text-white text-xs cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Hari Libur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
