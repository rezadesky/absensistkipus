import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { leaveApi } from '@/api/leave';
import type { LeaveRequestItem, PaginationMeta } from '@/types';
import {
  Check,
  X,
  Eye,
  Paperclip,
  Calendar,
  Building,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const LeaveAdminPage: React.FC = () => {
  const [items, setItems] = useState<LeaveRequestItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dialog States
  const [selectedItem, setSelectedItem] = useState<LeaveRequestItem | null>(null);
  const [actionType, setActionType] = useState<'detail' | 'approve' | 'reject' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLeaves = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await leaveApi.getLeaveRequests({
        page,
        per_page: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
      });

      if (res.success && res.data) {
        setItems(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat daftar izin.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  const handleOpenApprove = (item: LeaveRequestItem) => {
    setSelectedItem(item);
    setReviewNote('');
    setActionType('approve');
  };

  const handleOpenReject = (item: LeaveRequestItem) => {
    setSelectedItem(item);
    setReviewNote('');
    setActionType('reject');
  };

  const handleOpenDetail = (item: LeaveRequestItem) => {
    setSelectedItem(item);
    setActionType('detail');
  };

  const handleApproveSubmit = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      await leaveApi.approveLeave(selectedItem.id, reviewNote);
      setFeedback({ type: 'success', message: 'Pengajuan izin berhasil disetujui.' });
      setActionType(null);
      setSelectedItem(null);
      fetchLeaves(pagination.current_page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menyetujui pengajuan izin.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedItem) return;
    if (!reviewNote.trim()) {
      alert('Catatan/alasan penolakan wajib diisi.');
      return;
    }

    setIsProcessing(true);
    try {
      await leaveApi.rejectLeave(selectedItem.id, reviewNote);
      setFeedback({ type: 'success', message: 'Pengajuan izin berhasil ditolak.' });
      setActionType(null);
      setSelectedItem(null);
      fetchLeaves(pagination.current_page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menolak pengajuan izin.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Pengajuan Izin"
        subtitle="Verifikasi dan persetujuan pengajuan izin, sakit, cuti, atau dinas luar."
      />

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchLeaves(1)} className="font-semibold underline cursor-pointer">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filters */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-3.5 sm:p-4 flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter Status Izin"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Status</option>
            <option value="menunggu">Menunggu Review</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>

          <select
            aria-label="Filter Jenis Izin"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Jenis Izin</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
            <option value="dinas">Dinas Luar</option>
            <option value="keperluan_keluarga">Keperluan Keluarga</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </CardContent>
      </Card>

      {/* Leave Table */}
      <Card className="border border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-base font-bold text-secondary">
            Daftar Pengajuan Izin
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Total permohonan: <strong>{pagination.total}</strong> pengajuan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Pegawai</TableHead>
                  <TableHead className="w-[15%]">Jenis Izin</TableHead>
                  <TableHead className="w-[20%]">Tanggal Izin</TableHead>
                  <TableHead className="w-[20%]">Alasan / Keterangan</TableHead>
                  <TableHead className="w-[10%] text-center">Status</TableHead>
                  <TableHead className="w-[10%] text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-xs text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      <span>Memuat data perizinan...</span>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                      Belum ada pengajuan izin.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/70">
                      <TableCell>
                        <div className="font-semibold text-secondary text-xs sm:text-sm">
                          {item.user?.name || '-'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="capitalize font-medium">{item.user?.role || '-'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {item.user?.employee?.department || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 capitalize">
                          {item.type.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            {item.start_date} s/d {item.end_date}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-800 line-clamp-2" title={item.reason}>
                          {item.reason}
                        </p>
                        {item.attachment_url && (
                          <a
                            href={item.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1 font-medium"
                          >
                            <Paperclip className="h-3 w-3" />
                            <span>Lihat Lampiran</span>
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleOpenDetail(item)}
                            title="Detail Izin"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {item.status === 'menunggu' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                onClick={() => handleOpenApprove(item)}
                                title="Setujui Izin"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                onClick={() => handleOpenReject(item)}
                                title="Tolak Izin"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
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
              Halaman <strong>{pagination.current_page}</strong> dari <strong>{pagination.last_page}</strong> (Total {pagination.total} pengajuan)
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs cursor-pointer"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchLeaves(pagination.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs cursor-pointer"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchLeaves(pagination.current_page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog: Approve Confirmation */}
      <Dialog open={actionType === 'approve'} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-secondary flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Persetujuan Pengajuan Izin</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menyetujui pengajuan izin dari <strong className="text-slate-800">{selectedItem?.user?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border space-y-1">
              <p><strong>Jenis:</strong> <span className="capitalize">{selectedItem?.type.replace('_', ' ')}</span></p>
              <p><strong>Tanggal:</strong> {selectedItem?.start_date} s/d {selectedItem?.end_date}</p>
              <p><strong>Alasan:</strong> {selectedItem?.reason}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Persetujuan (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Disetujui, harap menjaga koordinasi tugas..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActionType(null)} className="text-xs cursor-pointer">
              Batal
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={handleApproveSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
            >
              {isProcessing ? 'Memproses...' : 'Ya, Setujui Izin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Reject Confirmation */}
      <Dialog open={actionType === 'reject'} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Penolakan Pengajuan Izin</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Berikan alasan/catatan penolakan untuk <strong className="text-slate-800">{selectedItem?.user?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alasan Penolakan * (Wajib Diisi):
              </label>
              <textarea
                required
                rows={3}
                placeholder="Contoh: Mohon dijadwalkan ulang karena bertepatan dengan agenda akreditasi..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActionType(null)} className="text-xs cursor-pointer">
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isProcessing}
              onClick={handleRejectSubmit}
              className="text-xs cursor-pointer"
            >
              {isProcessing ? 'Memproses...' : 'Tolak Pengajuan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Detail View */}
      <Dialog open={actionType === 'detail'} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-secondary flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Detail Pengajuan Izin</span>
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-3 py-2 text-xs text-slate-700">
              <div className="p-3 rounded-lg bg-slate-50 border space-y-1.5">
                <p><strong>Nama Pemohon:</strong> {selectedItem.user?.name}</p>
                <p><strong>Role & Unit:</strong> {selectedItem.user?.role} - {selectedItem.user?.employee?.department || '-'}</p>
                <p><strong>Jenis Izin:</strong> <span className="capitalize">{selectedItem.type.replace('_', ' ')}</span></p>
                <p><strong>Rentang Tanggal:</strong> {selectedItem.start_date} s/d {selectedItem.end_date}</p>
                <p><strong>Status Saat Ini:</strong> <StatusBadge status={selectedItem.status} /></p>
              </div>

              <div>
                <strong>Alasan / Keterangan:</strong>
                <p className="p-2.5 rounded-md bg-white border mt-1 text-slate-800 leading-relaxed">
                  {selectedItem.reason}
                </p>
              </div>

              {selectedItem.attachment_url && (
                <div>
                  <strong>Lampiran Dokumen:</strong>
                  <div className="mt-1">
                    <a
                      href={selectedItem.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-medium hover:underline"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>Buka File Lampiran</span>
                    </a>
                  </div>
                </div>
              )}

              {selectedItem.reviewed_by && (
                <div className="p-3 rounded-lg bg-slate-100 border text-[11px] space-y-1">
                  <p><strong>Direview oleh:</strong> {selectedItem.reviewer?.name || 'Administrator'}</p>
                  <p><strong>Waktu Review:</strong> {selectedItem.reviewed_at ? String(selectedItem.reviewed_at).substring(0, 19).replace('T', ' ') : '-'}</p>
                  <p><strong>Catatan Review:</strong> {selectedItem.review_note || '-'}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setActionType(null)} className="text-xs cursor-pointer">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
