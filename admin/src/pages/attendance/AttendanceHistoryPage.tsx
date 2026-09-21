import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { attendanceApi } from '@/api/attendance';
import type { AttendanceItem, PaginationMeta } from '@/types';
import { Search, Clock, Calendar, Building, Loader2, AlertCircle } from 'lucide-react';

export const AttendanceHistoryPage: React.FC = () => {
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getHistory({
        page,
        per_page: 15,
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        unit: unitFilter !== 'all' ? unitFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      if (res.success && res.data) {
        setItems(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat riwayat absensi.');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, unitFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Riwayat Absensi"
        subtitle="Daftar rekam jejak kehadiran pegawai dan pengarsipan presensi."
      />

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchHistory(1)} className="font-semibold underline cursor-pointer">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Advanced Filter Card */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama / NIP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <select
              aria-label="Filter Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Role</option>
              <option value="dosen">Dosen</option>
              <option value="tendik">Tendik</option>
            </select>

            <select
              aria-label="Filter Unit"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Unit</option>
              <option value="Dosen">Dosen</option>
              <option value="Tendik">Tendik</option>
              <option value="Pimpinan">Pimpinan</option>
            </select>

            <select
              aria-label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Dari:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sampai:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            {(startDate || endDate || search || roleFilter !== 'all' || unitFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-red-600 hover:bg-red-50 cursor-pointer ml-auto"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('all');
                  setUnitFilter('all');
                  setStatusFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-base font-bold text-secondary">
            Data Riwayat Absensi
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Total rekam presensi: <strong>{pagination.total}</strong> data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Tanggal</TableHead>
                  <TableHead className="w-[30%]">Pegawai</TableHead>
                  <TableHead className="w-[20%]">Unit & Role</TableHead>
                  <TableHead className="w-[15%]">Waktu Masuk</TableHead>
                  <TableHead className="w-[20%] text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-xs text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      <span>Memuat riwayat presensi...</span>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                      Tidak ada riwayat absensi pada rentang ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/70">
                      <TableCell className="font-mono text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.attendance_date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-secondary text-xs sm:text-sm">
                          {item.user ? (item.user as any).name : item.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.user && (item.user as any).employee?.employee_number
                            ? `NIP. ${(item.user as any).employee.employee_number}`
                            : item.nip ? `NIP. ${item.nip}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-slate-800">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {item.user && (item.user as any).employee?.department
                              ? (item.user as any).employee.department
                              : item.unit || '-'}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {item.user ? (item.user as any).role : item.role}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.check_in_time || item.checkInTime || item.check_in ? (
                          <span className="flex items-center gap-1 text-xs font-mono text-emerald-700">
                            <Clock className="h-3.5 w-3.5" />
                            {item.check_in_time || item.checkInTime || (item.check_in ? String(item.check_in).substring(11, 16) : '-')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <StatusBadge status={item.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Halaman <strong>{pagination.current_page}</strong> dari <strong>{pagination.last_page}</strong> (Total {pagination.total} data)
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs cursor-pointer"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchHistory(pagination.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs cursor-pointer"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchHistory(pagination.current_page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
