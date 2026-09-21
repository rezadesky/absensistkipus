import { useState, useCallback, useEffect } from 'react';
import { showAppAlert } from '../utils/alert';
import { attendanceApi, AttendanceHistoryResult } from '../api/attendance';
import type { TodayAttendanceInfo, AttendanceRecord } from '../types';

export const useAttendance = () => {
  const [todayInfo, setTodayInfo] = useState<TodayAttendanceInfo | null>(null);
  const [recentHistory, setRecentHistory] = useState<AttendanceRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{
    hadir: number;
    izin: number;
    tidakHadir: number;
    total: number;
  } | null>(null);

  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get formatted error message
  const parseErrorMessage = (err: any): string => {
    if (!err.response) {
      return 'Periksa koneksi internet Anda.';
    }

    const status = err.response.status;
    const data = err.response.data;

    switch (status) {
      case 401:
        return 'Sesi login telah berakhir. Silakan masuk kembali.';
      case 403:
        return data?.message || 'Anda tidak memiliki akses untuk melakukan absensi.';
      case 409:
        return data?.message || 'Anda sudah melakukan absensi hari ini.';
      case 422:
        if (data?.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          if (firstErrorKey && Array.isArray(data.errors[firstErrorKey])) {
            return data.errors[firstErrorKey][0];
          }
        }
        return data?.message || 'Data pengajuan tidak valid.';
      case 429:
        return 'Anda terlalu sering melakukan percobaan. Silakan coba beberapa saat lagi.';
      case 500:
      default:
        return 'Terjadi kesalahan pada server institusi.';
    }
  };

  // Fetch today status
  const fetchToday = useCallback(async () => {
    setError(null);
    try {
      const res = await attendanceApi.getTodayAttendance();
      if (res.success && res.data) {
        setTodayInfo(res.data);
      }
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setLoadingToday(false);
    }
  }, []);

  // Fetch recent history & calculate simple statistics for the current month
  const fetchHistory = useCallback(async () => {
    try {
      // Get page 1 with 15 records for current month
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const res = await attendanceApi.getHistory(1, 15, currentMonth, currentYear);
      if (res.success && res.data) {
        const items = res.data.items || [];
        setRecentHistory(items);

        // Derive statistics from actual verified history API
        const hadirCount = items.filter((item) => item.status === 'hadir').length;
        const izinCount = items.filter((item) => item.status === 'izin').length;
        const tidakHadirCount = items.filter(
          (item) => item.status === 'tidak_hadir' || item.status === 'ditolak'
        ).length;

        setMonthlyStats({
          hadir: hadirCount,
          izin: izinCount,
          tidakHadir: tidakHadirCount,
          total: items.length,
        });
      }
    } catch (err: any) {
      console.warn('Failed to load recent attendance history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Combined refresh
  const refreshAll = useCallback(async () => {
    setLoadingToday(true);
    setLoadingHistory(true);
    await Promise.all([fetchToday(), fetchHistory()]);
  }, [fetchToday, fetchHistory]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Check In Handler with confirmation and double submit prevention
  const performCheckIn = useCallback(async (): Promise<boolean> => {
    if (checkingIn) return false;

    // Client preliminary guard
    if (todayInfo?.has_checked_in) {
      showAppAlert('Perhatian', 'Anda sudah melakukan absensi hari ini.');
      return false;
    }

    if (todayInfo?.is_holiday) {
      showAppAlert('Hari Libur', todayInfo.holiday_name || 'Hari ini adalah hari libur.');
      return false;
    }

    if (todayInfo && !todayInfo.is_work_day) {
      showAppAlert('Bukan Hari Kerja', 'Hari ini bukan hari kerja aktif.');
      return false;
    }

    setCheckingIn(true);
    try {
      const res = await attendanceApi.checkIn();
      if (res.success) {
        const record = res.data;
        const timeStr = record?.check_in_time || (record?.check_in ? record.check_in.substring(11, 16) : '');
        const dateStr = record?.attendance_date || todayInfo?.server_date || '';

        showAppAlert(
          'Absensi Berhasil! 🎉',
          `Absensi masuk Anda telah tercatat pada ${dateStr} pukul ${timeStr} WIB. Terima kasih atas kehadirannya.`,
          [{ text: 'Selesai', style: 'default' }]
        );

        // Auto refresh
        await refreshAll();
        return true;
      } else {
        showAppAlert('Gagal', res.message || 'Gagal melakukan presensi.');
        return false;
      }
    } catch (err: any) {
      const msg = parseErrorMessage(err);
      showAppAlert('Absensi Gagal', msg);
      return false;
    } finally {
      setCheckingIn(false);
    }
  }, [checkingIn, todayInfo, refreshAll]);

  // Confirm Check In Dialog
  const confirmAndCheckIn = useCallback(() => {
    showAppAlert(
      'Konfirmasi Absensi Masuk',
      'Apakah Anda yakin ingin melakukan absen masuk hari ini?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Absen Sekarang',
          style: 'default',
          onPress: () => {
            performCheckIn();
          },
        },
      ]
    );
  }, [performCheckIn]);

  return {
    todayInfo,
    recentHistory,
    monthlyStats,
    loadingToday,
    loadingHistory,
    isLoading: loadingToday || loadingHistory,
    checkingIn,
    error,
    refreshAll,
    confirmAndCheckIn,
    performCheckIn,
  };
};
