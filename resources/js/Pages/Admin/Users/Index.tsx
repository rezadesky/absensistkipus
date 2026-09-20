import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Users, 
    UserPlus, 
    Search, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    X,
    Filter,
    Mail,
    Phone,
    Briefcase,
    Building2,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff
} from 'lucide-react';

interface UserItem {
    id: number;
    nip: string;
    nik?: string;
    name: string;
    email: string;
    role_type: string;
    jabatan?: string;
    unit_kerja?: string;
    jenis_kelamin?: string;
    no_hp?: string;
    is_active: boolean;
}

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search?: string;
        unit?: string;
        role?: string;
    };
    unitOptions: string[];
}

export default function AdminUsersIndex({ auth, users, filters, unitOptions }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        nip: '',
        nik: '',
        name: '',
        email: '',
        role_type: 'dosen_tendik',
        jabatan: '',
        unit_kerja: '',
        jenis_kelamin: 'L',
        no_hp: '',
        password: 'password123',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const searchInput = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get(route('admin.users.index'), { ...filters, search: searchInput }, { preserveState: true });
    };

    const handleFilter = (key: string, val: string) => {
        router.get(route('admin.users.index'), { ...filters, [key]: val }, { preserveState: true });
    };

    const openCreateModal = () => {
        form.reset();
        setEditingUser(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        form.setData({
            nip: user.nip || '',
            nik: user.nik || '',
            name: user.name,
            email: user.email,
            role_type: user.role_type,
            jabatan: user.jabatan || '',
            unit_kerja: user.unit_kerja || '',
            jenis_kelamin: (user.jenis_kelamin as any) || 'L',
            no_hp: user.no_hp || '',
            password: '',
            is_active: user.is_active,
        });
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            form.put(route('admin.users.update', editingUser.id), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('admin.users.store'), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pegawai ini dari sistem?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === 'admin') return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 uppercase">Admin</span>;
        if (role === 'pimpinan') return <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 uppercase">Pimpinan</span>;
        return <span className="bg-blue-100 text-[#0F2747] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase">Dosen / Tendik</span>;
    };

    return (
        <AuthenticatedLayout
            auth={auth as any}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0F2747]">Data Pegawai (Dosen & Tendik)</h2>
                        <p className="text-xs text-slate-500">Kelola master akun, NIP, unit kerja, jabatan, dan status pegawai</p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-bold text-xs shadow-md transition"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Tambah Pegawai Baru</span>
                    </button>
                </div>
            }
        >
            <Head title="Data Pegawai - Absensi Fungsional STKIP Usman Safri" />

            <div className="space-y-4 sm:space-y-6">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters.search || ''}
                            placeholder="Cari Nama, NIP, atau Email..."
                            className="w-full text-xs rounded-xl border-slate-200 pl-9 pr-4 py-2.5 focus:border-[#0F2747] focus:ring-[#0F2747]/20"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </form>

                    <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
                        <select
                            value={filters.unit || 'semua'}
                            onChange={(e) => handleFilter('unit', e.target.value)}
                            className="w-full sm:w-auto text-xs font-medium rounded-xl border-slate-200 bg-slate-50 py-2.5 focus:border-[#0F2747] focus:ring-[#0F2747]/20"
                        >
                            <option value="semua">Semua Prodi</option>
                            <option value="Pendidikan Bahasa dan Sastra Indonesia">Pendidikan Bahasa dan Sastra Indonesia</option>
                            <option value="Pendidikan Bahasa Inggris">Pendidikan Bahasa Inggris</option>
                        </select>

                        <select
                            value={filters.role || 'semua'}
                            onChange={(e) => handleFilter('role', e.target.value)}
                            className="w-full sm:w-auto text-xs font-medium rounded-xl border-slate-200 bg-slate-50 py-2.5 focus:border-[#0F2747] focus:ring-[#0F2747]/20"
                        >
                            <option value="semua">Semua Role</option>
                            <option value="dosen_tendik">Dosen & Tendik</option>
                            <option value="pimpinan">Pimpinan</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                {/* 1. MOBILE RESPONSIVE CARD VIEW (Tampil di layar HP / sm:hidden) */}
                <div className="block md:hidden space-y-3">
                    {users.data.length > 0 ? (
                        users.data.map((u) => (
                            <div key={u.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                                {/* Top: Name, NIP & Role Badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-800 leading-snug">{u.name}</h3>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">NIP/NIDN: {u.nip || '-'}</p>
                                    </div>
                                    <div className="shrink-0">{getRoleBadge(u.role_type)}</div>
                                </div>

                                {/* Body Details: Prodi & Kontak */}
                                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5 text-[#0F2747] shrink-0" />
                                        <span className="font-semibold text-slate-700 truncate">{u.unit_kerja || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-slate-500 truncate">{u.email}</span>
                                    </div>
                                    {u.no_hp && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="text-slate-500">{u.no_hp}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom: Actions */}
                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                    <button
                                        onClick={() => openEditModal(u)}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-sm"
                                    >
                                        <Edit className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
                            Tidak ditemukan data pegawai yang sesuai.
                        </div>
                    )}
                </div>

                {/* 2. DESKTOP TABLE VIEW (Tampil di md ke atas) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Nama Pegawai & NIP/NIDN</th>
                                    <th className="px-6 py-3.5">Email & No. HP</th>
                                    <th className="px-6 py-3.5">Program Studi</th>
                                    <th className="px-6 py-3.5">Jabatan / Role</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.data.length > 0 ? (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{u.name}</p>
                                                <p className="text-[11px] text-slate-400 font-mono">NIP/NIDN: {u.nip || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <p className="text-slate-700">{u.email}</p>
                                                <p className="text-slate-400">{u.no_hp || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <p className="font-semibold text-slate-800">{u.unit_kerja || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs whitespace-nowrap">
                                                {getRoleBadge(u.role_type)}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                                                        title="Edit Data"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition"
                                                        title="Hapus Pegawai"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            Tidak ditemukan data pegawai yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Create/Edit (Responsive Bottom-Sheet / Center Modal) */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
                                <h3 className="font-bold text-base text-[#0F2747]">
                                    {editingUser ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                                </h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">NIP / NIDN *</label>
                                    <input
                                        type="text"
                                        value={form.data.nip}
                                        onChange={(e) => form.setData('nip', e.target.value)}
                                        placeholder="Nomor Induk Pegawai / Nomor Induk Dosen Nasional"
                                        className={`w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.nip ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                        required
                                    />
                                    {form.errors.nip && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.nip}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nama Lengkap & Gelar *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd."
                                        className={`w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.name ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                        required
                                    />
                                    {form.errors.name && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            placeholder="nama@stkipusmansafri.ac.id"
                                            className={`w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.email ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                            required
                                        />
                                        {form.errors.email && (
                                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">No. HP / WhatsApp</label>
                                        <input
                                            type="text"
                                            value={form.data.no_hp}
                                            onChange={(e) => form.setData('no_hp', e.target.value)}
                                            placeholder="081234567890"
                                            className={`w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.no_hp ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                        />
                                        {form.errors.no_hp && (
                                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.no_hp}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Program Studi (Prodi) *</label>
                                        <select
                                            value={form.data.unit_kerja}
                                            onChange={(e) => form.setData('unit_kerja', e.target.value)}
                                            className={`w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.unit_kerja ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                            required
                                        >
                                            <option value="">-- Pilih Program Studi --</option>
                                            <option value="Pendidikan Bahasa dan Sastra Indonesia">Pendidikan Bahasa dan Sastra Indonesia</option>
                                            <option value="Pendidikan Bahasa Inggris">Pendidikan Bahasa Inggris</option>
                                        </select>
                                        {form.errors.unit_kerja && (
                                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.unit_kerja}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Jabatan / Role Akses *</label>
                                        <select
                                            value={form.data.role_type}
                                            onChange={(e) => form.setData('role_type', e.target.value as any)}
                                            className={`w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.role_type ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                        >
                                            <option value="dosen_tendik">Dosen / Tendik</option>
                                            <option value="pimpinan">Pimpinan</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                        {form.errors.role_type && (
                                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.role_type}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Jenis Kelamin</label>
                                        <select
                                            value={form.data.jenis_kelamin}
                                            onChange={(e) => form.setData('jenis_kelamin', e.target.value as any)}
                                            className={`w-full text-xs rounded-xl border-slate-200 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.jenis_kelamin ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                        {form.errors.jenis_kelamin && (
                                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.jenis_kelamin}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                            Password {editingUser && '(Kosongkan jika tidak diubah)'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={form.data.password}
                                                onChange={(e) => form.setData('password', e.target.value)}
                                                placeholder={editingUser ? '••••••••' : 'Default: password123'}
                                                className={`w-full text-xs rounded-xl border-slate-200 pr-10 focus:border-[#0F2747] focus:ring-[#0F2747]/20 ${form.errors.password ? 'border-rose-400 focus:border-rose-500' : ''}`}
                                                required={!editingUser}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                        {form.errors.password && (
                                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{form.errors.password}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F2747] text-white text-xs font-bold hover:bg-[#163863] shadow"
                                    >
                                        {form.processing ? 'Menyimpan...' : 'Simpan Data'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
