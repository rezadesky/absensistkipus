<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PresensiController;
use App\Http\Controllers\IzinController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\PengaturanController as AdminPengaturanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes - SiAbsen STKIP Usman Safri Kutacane
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // 1. Dashboard (Role-based automatically dispatched by controller)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Presensi (Dosen / Tendik) - Form checkin langsung di Dashboard
    Route::get('/presensi', fn() => redirect()->route('dashboard'))->name('presensi.create');
    Route::post('/presensi', [PresensiController::class, 'store'])->name('presensi.store');
    Route::get('/riwayat-presensi', [PresensiController::class, 'riwayat'])->name('presensi.riwayat');

    // 3. Pengajuan Izin / Cuti
    Route::get('/pengajuan-izin', [IzinController::class, 'index'])->name('izin.index');
    Route::get('/pengajuan-izin/baru', [IzinController::class, 'create'])->name('izin.create');
    Route::post('/pengajuan-izin', [IzinController::class, 'store'])->name('izin.store');

    // 4. Laporan & Rekap (Accessible by Admin & Pimpinan)
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');

    // 5. Admin Specific Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        // Manajemen Pengguna
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Persetujuan Izin
        Route::get('/izin', [IzinController::class, 'adminIndex'])->name('izin.index');
        Route::patch('/izin/{id}/status', [IzinController::class, 'updateStatus'])->name('izin.status');

        // Pengaturan Sistem & Geofencing
        Route::get('/pengaturan', [AdminPengaturanController::class, 'index'])->name('pengaturan.index');
        Route::post('/pengaturan', [AdminPengaturanController::class, 'update'])->name('pengaturan.update');
    });

    // 6. User Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
