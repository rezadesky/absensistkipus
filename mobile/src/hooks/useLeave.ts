import { useState, useCallback, useEffect } from 'react';
import { showAppAlert } from '../utils/alert';
import { leaveApi, CreateLeavePayload } from '../api/leave';
import type { LeaveRequest, PaginationMeta } from '../types';

export const useLeave = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to parse leave error messages
  const parseErrorMessage = (err: any): string => {
    if (!err.response) {
      return 'Periksa koneksi internet Anda.';
    }

    const status = err.response.status;
    const data = err.response.data;

    switch (status) {
      case 401:
        return 'Sesi Anda telah berakhir. Silakan login kembali.';
      case 403:
        return data?.message || 'Anda tidak memiliki akses untuk mengajukan izin.';
      case 404:
        return 'Data pengajuan izin tidak ditemukan.';
      case 409:
        return data?.message || 'Anda sudah memiliki pengajuan izin pada rentang tanggal tersebut.';
      case 422:
        if (data?.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          if (firstErrorKey && Array.isArray(data.errors[firstErrorKey])) {
            return data.errors[firstErrorKey][0];
          }
        }
        return data?.message || 'Data pengajuan izin tidak valid.';
      case 429:
        return 'Terlalu banyak percobaan. Silakan coba sesaat lagi.';
      case 500:
      default:
        return 'Terjadi kesalahan pada server saat memproses pengajuan.';
    }
  };

  // Fetch paginated user leave requests
  const fetchLeaves = useCallback(async (page = 1, status?: string) => {
    setError(null);
    if (page === 1) {
      setLoading(true);
    }

    try {
      const res = await leaveApi.getMyLeaves(page, 10, status);
      if (res.success && res.data) {
        if (page === 1) {
          setLeaves(res.data.items || []);
        } else {
          setLeaves((prev) => [...prev, ...(res.data.items || [])]);
        }
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single leave detail
  const fetchLeaveDetail = useCallback(async (id: number): Promise<LeaveRequest | null> => {
    try {
      const res = await leaveApi.getLeaveDetail(id);
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (err: any) {
      showAppAlert('Gagal Memuat Detail', parseErrorMessage(err));
      return null;
    }
  }, []);

  // Submit leave request
  const createLeave = useCallback(
    async (payload: CreateLeavePayload): Promise<boolean> => {
      if (submitting) return false;

      // Client validations
      if (!payload.type) {
        showAppAlert('Form Belum Lengkap', 'Pilih jenis izin yang diajukan.');
        return false;
      }
      if (!payload.start_date || !payload.end_date) {
        showAppAlert('Form Belum Lengkap', 'Tanggal mulai dan selesai wajib diisi.');
        return false;
      }
      if (payload.end_date < payload.start_date) {
        showAppAlert('Tanggal Tidak Valid', 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
        return false;
      }
      if (!payload.reason || !payload.reason.trim()) {
        showAppAlert('Form Belum Lengkap', 'Alasan pengajuan izin wajib diisi.');
        return false;
      }

      setSubmitting(true);
      try {
        const res = await leaveApi.createLeave(payload);
        if (res.success) {
          showAppAlert(
            'Pengajuan Berhasil Dikirim! 🎉',
            'Permohonan izin Anda telah tercatat dengan status Menunggu verifikasi dari bagian Kepegawaian/Pimpinan.',
            [{ text: 'OK' }]
          );
          // Refresh list to top
          await fetchLeaves(1);
          return true;
        } else {
          showAppAlert('Gagal Mengajukan', res.message || 'Terjadi kegagalan saat mengirim izin.');
          return false;
        }
      } catch (err: any) {
        const msg = parseErrorMessage(err);
        showAppAlert('Pengajuan Gagal', msg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, fetchLeaves]
  );

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  return {
    leaves,
    pagination,
    loading,
    submitting,
    error,
    fetchLeaves,
    fetchLeaveDetail,
    createLeave,
  };
};
