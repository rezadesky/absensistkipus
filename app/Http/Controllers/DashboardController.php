<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Presensi;
use App\Models\PengajuanIzin;
use App\Models\User;
use App\Models\PengaturanAbsensi;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();
        $thisMonth = Carbon::today()->month;
        $thisYear = Carbon::today()->year;

        // Route to different dashboard according to role
        if ($user->hasRole('admin') || $user->role_type === 'admin') {
            // Admin Dashboard Data
            $totalPegawai = User::where('role_type', 'dosen_tendik')->where('is_active', true)->count();
            
            $presensiHariIni = Presensi::with('user')
                ->where('tanggal', $today)
                ->get();
                
            $hadirTepatWaktu = $presensiHariIni->where('status', 'hadir')->count();
            $terlambat = $presensiHariIni->where('status', 'terlambat')->count();
            $izin = $presensiHariIni->whereIn('status', ['izin', 'cuti'])->count();
            $sudahAbsenUserIds = $presensiHariIni->pluck('user_id')->toArray();
            $belumAbsen = User::where('role_type', 'dosen_tendik')
                ->where('is_active', true)
                ->whereNotIn('id', $sudahAbsenUserIds)
                ->get(['id', 'name', 'nip', 'unit_kerja', 'jabatan', 'foto']);

            $pengajuanIzinPending = PengajuanIzin::with('user')
                ->where('status', 'menunggu')
                ->latest()
                ->take(5)
                ->get();

            $pengaturan = PengaturanAbsensi::first();

            return Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'totalPegawai' => $totalPegawai,
                    'hadirTepatWaktu' => $hadirTepatWaktu,
                    'terlambat' => $terlambat,
                    'izin' => $izin,
                    'belumAbsenCount' => $belumAbsen->count(),
                ],
                'presensiHariIni' => $presensiHariIni,
                'belumAbsen' => $belumAbsen,
                'pengajuanIzinPending' => $pengajuanIzinPending,
                'pengaturan' => $pengaturan,
            ]);
        } elseif ($user->hasRole('pimpinan') || $user->role_type === 'pimpinan') {
            // Pimpinan Dashboard Data (Analytics, Executive Summary)
            $totalPegawai = User::where('role_type', 'dosen_tendik')->where('is_active', true)->count();
            $presensiHariIni = Presensi::with('user')->where('tanggal', $today)->get();
            
            $hadir = $presensiHariIni->whereIn('status', ['hadir', 'terlambat'])->count();
            $terlambat = $presensiHariIni->where('status', 'terlambat')->count();
            $izin = $presensiHariIni->whereIn('status', ['izin', 'cuti'])->count();
            $alpa = $totalPegawai - $presensiHariIni->count();
            if ($alpa < 0) $alpa = 0;

            // Monthly Trend (Past 7 days)
            $trendHari = [];
            for ($i = 6; $i >= 0; $i--) {
                $d = Carbon::today()->subDays($i);
                $dString = $d->toDateString();
                $dayPresensi = Presensi::where('tanggal', $dString)->get();
                $trendHari[] = [
                    'tanggal' => $d->format('d M'),
                    'hadir' => $dayPresensi->where('status', 'hadir')->count(),
                    'terlambat' => $dayPresensi->where('status', 'terlambat')->count(),
                    'izin' => $dayPresensi->whereIn('status', ['izin', 'cuti'])->count(),
                    'alpa' => $dayPresensi->where('status', 'alpa')->count(),
                ];
            }

            // Per Unit Kehadiran
            $unitList = ['Pendidikan Guru Sekolah Dasar (PGSD)', 'Pendidikan Matematika', 'Pendidikan Bahasa Indonesia', 'BAAK', 'Bagian Keuangan'];
            $unitStats = [];
            foreach ($unitList as $unit) {
                $unitUserIds = User::where('unit_kerja', $unit)->pluck('id');
                $totalUnitUsers = $unitUserIds->count();
                $hadirUnit = Presensi::whereIn('user_id', $unitUserIds)->where('tanggal', $today)->whereIn('status', ['hadir', 'terlambat'])->count();
                $persentase = $totalUnitUsers > 0 ? round(($hadirUnit / $totalUnitUsers) * 100) : 0;
                $unitStats[] = [
                    'unit' => $unit,
                    'total' => $totalUnitUsers,
                    'hadir' => $hadirUnit,
                    'persentase' => $persentase,
                ];
            }

            return Inertia::render('Pimpinan/Dashboard', [
                'stats' => [
                    'totalPegawai' => $totalPegawai,
                    'hadir' => $hadir,
                    'terlambat' => $terlambat,
                    'izin' => $izin,
                    'alpa' => $alpa,
                    'rateKehadiran' => $totalPegawai > 0 ? round(($hadir / $totalPegawai) * 100) : 0,
                ],
                'trendMingguan' => $trendHari,
                'unitStats' => $unitStats,
            ]);
        } else {
            // Dosen & Tendik Dashboard
            $presensiHariIni = Presensi::where('user_id', $user->id)
                ->where('tanggal', $today)
                ->first();

            // Monthly stats
            $presensiBulanIni = Presensi::where('user_id', $user->id)
                ->whereMonth('tanggal', $thisMonth)
                ->whereYear('tanggal', $thisYear)
                ->get();

            $hadirCount = $presensiBulanIni->where('status', 'hadir')->count();
            $terlambatCount = $presensiBulanIni->where('status', 'terlambat')->count();
            $izinCount = $presensiBulanIni->whereIn('status', ['izin', 'cuti'])->count();
            $alpaCount = $presensiBulanIni->where('status', 'alpa')->count();

            // Recent 7 days attendance
            $riwayatTerbaru = Presensi::where('user_id', $user->id)
                ->latest('tanggal')
                ->take(7)
                ->get();

            // Recent leave / cuti requests for employee
            $pengajuanIzinTerbaru = PengajuanIzin::with('approver')
                ->where('user_id', $user->id)
                ->latest()
                ->take(3)
                ->get();

            // Izin aktif hari ini
            $izinAktifHariIni = PengajuanIzin::where('user_id', $user->id)
                ->where('status', 'disetujui')
                ->where('tanggal_mulai', '<=', $today)
                ->where('tanggal_selesai', '>=', $today)
                ->first();

            $pengaturan = PengaturanAbsensi::first();

            return Inertia::render('Dashboard', [
                'presensiHariIni' => $presensiHariIni,
                'statsBulanIni' => [
                    'hadir' => $hadirCount,
                    'terlambat' => $terlambatCount,
                    'izin' => $izinCount,
                    'alpa' => $alpaCount,
                    'totalHadir' => $hadirCount + $terlambatCount,
                ],
                'riwayatTerbaru' => $riwayatTerbaru,
                'pengajuanIzinTerbaru' => $pengajuanIzinTerbaru,
                'izinAktifHariIni' => $izinAktifHariIni,
                'pengaturan' => $pengaturan,
            ]);
        }
    }
}
