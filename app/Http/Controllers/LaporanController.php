<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Presensi;
use App\Models\User;
use Carbon\Carbon;

class LaporanController extends Controller
{
    /**
     * Display comprehensive attendance reports with filtering per date/month/unit
     */
    public function index(Request $request)
    {
        $bulan = $request->input('bulan', Carbon::now()->month);
        $tahun = $request->input('tahun', Carbon::now()->year);
        $unit = $request->input('unit', 'semua');
        $status = $request->input('status', 'semua');

        $usersQuery = User::where('role_type', 'dosen_tendik')->where('is_active', true);
        if ($unit && $unit !== 'semua') {
            $usersQuery->where('unit_kerja', $unit);
        }
        $users = $usersQuery->get();

        $presensiQuery = Presensi::with('user')
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun);

        if ($unit && $unit !== 'semua') {
            $presensiQuery->whereHas('user', function ($q) use ($unit) {
                $q->where('unit_kerja', $unit);
            });
        }

        if ($status && $status !== 'semua') {
            $presensiQuery->where('status', $status);
        }

        $presensi = $presensiQuery->orderBy('tanggal', 'desc')->paginate(20);

        // Rekap Summary Table per Pegawai
        $rekapPegawai = [];
        foreach ($users as $user) {
            $userPresensi = Presensi::where('user_id', $user->id)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->get();

            $rekapPegawai[] = [
                'user_id' => $user->id,
                'name' => $user->name,
                'nip' => $user->nip,
                'unit_kerja' => $user->unit_kerja,
                'hadir' => $userPresensi->where('status', 'hadir')->count(),
                'terlambat' => $userPresensi->where('status', 'terlambat')->count(),
                'izin' => $userPresensi->whereIn('status', ['izin', 'cuti'])->count(),
                'alpa' => $userPresensi->where('status', 'alpa')->count(),
                'total_kehadiran' => $userPresensi->whereIn('status', ['hadir', 'terlambat'])->count(),
            ];
        }

        $unitOptions = User::whereNotNull('unit_kerja')->distinct()->pluck('unit_kerja');

        return Inertia::render('Laporan/Index', [
            'presensi' => $presensi,
            'rekapPegawai' => $rekapPegawai,
            'filters' => [
                'bulan' => (int) $bulan,
                'tahun' => (int) $tahun,
                'unit' => $unit,
                'status' => $status,
            ],
            'unitOptions' => $unitOptions,
        ]);
    }
}
