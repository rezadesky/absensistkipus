<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display list of users (Dosen & Tendik)
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $unit = $request->input('unit');
        $role = $request->input('role');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($unit && $unit !== 'semua') {
            $query->where('unit_kerja', $unit);
        }

        if ($role && $role !== 'semua') {
            $query->where('role_type', $role);
        }

        $users = $query->latest()->paginate(10);
        $units = User::whereNotNull('unit_kerja')->distinct()->pluck('unit_kerja');

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'unit' => $unit ?? 'semua',
                'role' => $role ?? 'semua',
            ],
            'unitOptions' => $units,
        ]);
    }

    /**
     * Store newly created user
     */
    public function store(Request $request)
    {
        $request->validate([
            'nip' => 'required|string|unique:users,nip',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role_type' => 'required|in:admin,pimpinan,dosen_tendik',
            'jabatan' => 'nullable|string|max:255',
            'unit_kerja' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'no_hp' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        $defaultJabatan = match($request->role_type) {
            'admin' => 'Administrator',
            'pimpinan' => 'Pimpinan',
            default => 'Dosen / Tendik',
        };

        $user = User::create([
            'nip' => $request->nip,
            'name' => $request->name,
            'email' => $request->email,
            'role_type' => $request->role_type,
            'jabatan' => $request->jabatan ?: $defaultJabatan,
            'unit_kerja' => $request->unit_kerja,
            'jenis_kelamin' => $request->jenis_kelamin,
            'no_hp' => $request->no_hp,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        $user->assignRole($request->role_type);

        return redirect()->back()->with('success', 'Pegawai baru berhasil ditambahkan.');
    }

    /**
     * Update user details
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nip' => 'required|string|unique:users,nip,' . $user->id,
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role_type' => 'required|in:admin,pimpinan,dosen_tendik',
            'jabatan' => 'nullable|string|max:255',
            'unit_kerja' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'no_hp' => 'nullable|string|max:20',
            'is_active' => 'required|boolean',
        ]);

        $defaultJabatan = match($request->role_type) {
            'admin' => 'Administrator',
            'pimpinan' => 'Pimpinan',
            default => 'Dosen / Tendik',
        };

        $userData = [
            'nip' => $request->nip,
            'name' => $request->name,
            'email' => $request->email,
            'role_type' => $request->role_type,
            'jabatan' => $request->jabatan ?: $defaultJabatan,
            'unit_kerja' => $request->unit_kerja,
            'jenis_kelamin' => $request->jenis_kelamin,
            'no_hp' => $request->no_hp,
            'is_active' => $request->is_active,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);
        $user->syncRoles([$request->role_type]);

        return redirect()->back()->with('success', 'Data pegawai berhasil diperbarui.');
    }

    /**
     * Delete user
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();
        return redirect()->back()->with('success', 'Pegawai berhasil dihapus dari sistem.');
    }
}
