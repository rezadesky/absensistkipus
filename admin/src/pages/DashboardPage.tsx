import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { AttendanceTable } from '@/components/dashboard/AttendanceTable';
import { dashboardApi } from '@/api/dashboard';
import type { AttendanceItem } from '@/types';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  // Filter States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Data States
  const [stats, setStats] = useState({
    total_dosen: 0,
    total_tendik: 0,
    hadir_hari_ini: 0,
    belum_absen: 0,
    izin: 0,
  });
  const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getDashboard({
        date: dateFilter,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        unit: unitFilter !== 'all' ? unitFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      });

      if (response.success && response.data) {
        setStats(response.data.stats);
        setAttendanceList(response.data.attendance_today);
      } else {
        throw new Error(response.message || 'Gagal memuat data dashboard.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Terjadi kesalahan saat mengambil data dari server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, roleFilter, unitFilter, statusFilter, search]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleResetFilter = () => {
    setSearch('');
    setRoleFilter('all');
    setUnitFilter('all');
    setStatusFilter('all');
    setDateFilter(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-3.5 sm:space-y-6 overflow-x-hidden">
      {/* Page Header with Quick Actions */}
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan aktivitas absensi fungsional STKIP Usman Safri."
      >
        <QuickActions />
      </PageHeader>

      {/* Error Alert with Retry button */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-red-300 text-red-700 hover:bg-red-100 gap-1.5 cursor-pointer"
            onClick={fetchDashboardData}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Coba Lagi</span>
          </Button>
        </div>
      )}

      {/* 5 Statistic Cards Grid (Aggregated Database Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 w-full min-w-0">
        <StatCard
          label="Total Dosen"
          value={stats.total_dosen}
          icon={GraduationCap}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
          description="Dosen fungsional aktif"
        />
        <StatCard
          label="Total Tendik"
          value={stats.total_tendik}
          icon={Users}
          iconColorClass="text-indigo-600"
          iconBgClass="bg-indigo-50"
          description="Staf tendik aktif"
        />
        <StatCard
          label="Hadir Hari Ini"
          value={stats.hadir_hari_ini}
          icon={CheckCircle2}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
          description="Presensi masuk tercatat"
        />
        <StatCard
          label="Belum Absen"
          value={stats.belum_absen}
          icon={Clock}
          iconColorClass="text-slate-500"
          iconBgClass="bg-slate-100"
          description="Belum ada presensi"
        />
        <StatCard
          label="Izin"
          value={stats.izin}
          icon={FileCheck}
          iconColorClass="text-primary"
          iconBgClass="bg-primary/10"
          description="Izin / tugas luar / sakit"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        unitFilter={unitFilter}
        onUnitFilterChange={setUnitFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onReset={handleResetFilter}
      />

      {/* Attendance Table from Real Database API */}
      <AttendanceTable data={attendanceList} isLoading={isLoading} />
    </div>
  );
};
