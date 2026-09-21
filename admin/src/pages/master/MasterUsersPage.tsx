import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { usersApi, type UserFormData } from '@/api/users';
import type { User, PaginationMeta } from '@/types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building,
  GraduationCap,
  Users,
  ShieldAlert,
  UserCog,
} from 'lucide-react';

interface MasterUsersPageProps {
  roleKey: 'dosen' | 'tendik' | 'pimpinan' | 'admins';
  title: string;
  category: string;
  description: string;
}

export const MasterUsersPage: React.FC<MasterUsersPageProps> = ({
  roleKey,
  title,
  category,
  description,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Field States
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    status: 'active',
    employee_number: '',
    department: '',
    position: '',
    phone: '',
  });

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.getUsers(roleKey, {
        page,
        per_page: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });

      if (res.success && res.data) {
        setUsers(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data pengguna.');
    } finally {
      setIsLoading(false);
    }
  }, [roleKey, search, statusFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      status: 'active',
      employee_number: '',
      department: roleKey === 'dosen' ? 'Dosen' : roleKey === 'tendik' ? 'Tendik' : 'Pimpinan',
      position: '',
      phone: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      status: (user.status as 'active' | 'inactive') || 'active',
      employee_number: user.employee?.employee_number || '',
      department: user.employee?.department || '',
      position: user.employee?.position || '',
      phone: user.employee?.phone || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (editingUser) {
        // Update
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await usersApi.updateUser(roleKey, editingUser.id, payload);
        setFeedback({ type: 'success', message: `Data ${title} berhasil diperbarui.` });
      } else {
        // Create
        await usersApi.createUser(roleKey, formData);
        setFeedback({ type: 'success', message: `Data ${title} baru berhasil ditambahkan.` });
      }
      setIsFormOpen(false);
      fetchUsers(pagination.current_page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await usersApi.deleteUser(roleKey, deleteTarget.id);
      setFeedback({ type: 'success', message: `Akun ${deleteTarget.name} berhasil dihapus.` });
      setDeleteTarget(null);
      fetchUsers(pagination.current_page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menghapus data.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await usersApi.updateUser(roleKey, user.id, {
        name: user.name,
        email: user.email,
        status: newStatus,
      });
      setFeedback({
        type: 'success',
        message: `Status ${user.name} diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`,
      });
      fetchUsers(pagination.current_page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengubah status.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const getRoleIcon = () => {
    switch (roleKey) {
      case 'dosen':
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
      case 'tendik':
        return <Users className="h-5 w-5 text-indigo-600" />;
      case 'pimpinan':
        return <ShieldAlert className="h-5 w-5 text-amber-600" />;
      default:
        return <UserCog className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <PageHeader title={title} subtitle={`${category} — ${description}`}>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-orange-600 text-white gap-2 text-xs font-semibold cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah {title.replace('Data ', '')}</span>
        </Button>
      </PageHeader>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchUsers(1)} className="font-semibold underline cursor-pointer">
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

      {/* Filter and Search Bar */}
      <Card className="border border-border shadow-xs bg-white">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Cari nama, NIP, email...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="Filter status pegawai"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-36"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100">{getRoleIcon()}</div>
              <div>
                <CardTitle className="text-base font-bold text-secondary">
                  Daftar {title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Total terdaftar: <strong>{pagination.total}</strong> akun
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Nama & NIP</TableHead>
                  <TableHead className="w-[25%]">Email & Kontak</TableHead>
                  <TableHead className="w-[20%]">Unit & Jabatan</TableHead>
                  <TableHead className="w-[10%] text-center">Status</TableHead>
                  <TableHead className="w-[15%] text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                      Belum ada data yang sesuai.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/70">
                      <TableCell>
                        <div className="font-semibold text-secondary text-xs sm:text-sm">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.employee?.employee_number ? `NIP/NIDN: ${item.employee.employee_number}` : 'NIP/NIDN: -'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-800">{item.email}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.employee?.phone || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-slate-800 font-medium">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{item.employee?.department || '-'}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.employee?.position || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleToggleStatus(item)}
                            title={item.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            {item.status === 'active' ? (
                              <UserX className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => setDeleteTarget(item)}
                            title="Hapus Data"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
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
                onClick={() => fetchUsers(pagination.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs cursor-pointer"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchUsers(pagination.current_page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog: Create / Edit User */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-secondary">
              {editingUser ? `Edit ${title}` : `Tambah ${title}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Lengkapi data profil dan akun di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <Input
                required
                placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Akun *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password {editingUser ? '(Kosongkan jika tetap)' : '*'}
                </label>
                <Input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP / NIDN
                </label>
                <Input
                  placeholder="198203152008..."
                  value={formData.employee_number}
                  onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit / Departemen
                </label>
                <select
                  aria-label="Pilih Unit / Departemen Pegawai"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Dosen">Dosen</option>
                  <option value="Tendik">Tendik</option>
                  <option value="Pimpinan">Pimpinan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Fungsional / Posisi
                </label>
                <Input
                  placeholder="Contoh: Lektor / Staf IT"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <Input
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="text-xs h-9 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-orange-600 text-white text-xs h-9 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingUser ? 'Simpan Perubahan' : 'Tambah Akun'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Konfirmasi Hapus Akun</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus akun <strong className="text-slate-800">{deleteTarget?.name}</strong>? Tindakan ini akan menghapus riwayat presensi terkait.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteUser}
              className="text-xs cursor-pointer"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
