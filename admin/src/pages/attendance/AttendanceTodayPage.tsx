import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { AttendanceTable } from '@/components/dashboard/AttendanceTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { attendanceApi } from '@/api/attendance';
import type { AttendanceItem } from '@/types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AttendanceTodayPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);

  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getTodayAttendance({
        date: dateFilter,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        unit: unitFilter !== 'all' ? unitFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });

      if (res.success && res.data) {
        setItems(res.data.items);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat absensi hari ini.');
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, roleFilter, unitFilter, statusFilter, search]);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  const handleReset = () => {
    setSearch('');
    setRoleFilter('all');
    setUnitFilter('all');
    setStatusFilter('all');
    setDateFilter(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Absensi Hari Ini"
        subtitle="Monitoring kehadiran dosen dan staf tendik secara real-time."
      >
        <Button
          onClick={fetchTodayData}
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs text-secondary cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Segarkan Data</span>
        </Button>
      </PageHeader>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={fetchTodayData} className="font-semibold underline">
            Coba Lagi
          </button>
        </div>
      )}

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
        onReset={handleReset}
      />

      <AttendanceTable data={items} isLoading={isLoading} />
    </div>
  );
};
