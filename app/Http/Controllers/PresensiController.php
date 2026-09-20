<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Presensi;
use App\Models\PengaturanAbsensi;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PresensiController extends Controller
{
    /**
     * Presensi Check-in Page (Absen Masuk Saja)
     */
    public function create()
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();
        
        $presensiHariIni = Presensi::where('user_id', $user->id)
            ->where('tanggal', $today)
            ->first();

        $pengaturan = PengaturanAbsensi::first();

        return Inertia::render('Presensi/Create', [
            'presensiHariIni' => $presensiHariIni,
            'pengaturan' => $pengaturan,
        ]);
    }

    /**
     * Store Check-in Presensi (Hanya Sekali Masuk)
     */
    public function store(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'foto' => 'nullable|string',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();
        $currentTime = $now->format('H:i:s');

        // Check if already checked in today
        $existing = Presensi::where('user_id', $user->id)->where('tanggal', $today)->first();
        if ($existing && $existing->jam_masuk) {
            return redirect()->back()->with('error', 'Anda sudah melakukan absen masuk hari ini.');
        }

        $pengaturan = PengaturanAbsensi::first();
        $campusLat = $pengaturan->latitude ?? 3.486250;
        $campusLng = $pengaturan->longitude ?? 97.809167;
        $maxRadius = $pengaturan->radius_meter ?? 200;

        // 1. Validasi Radius Geofencing Lokasi
        $distance = $this->calculateDistance(
            (float) $request->latitude, 
            (float) $request->longitude, 
            (float) $campusLat, 
            (float) $campusLng
        );

        if ($distance > $maxRadius) {
            return redirect()->back()->with(
                'error', 
                "Absen Ditolak! Anda berada di luar radius lokasi kampus STKIP Usman Safri (Jarak Anda: {$distance} meter, Batas toleransi: {$maxRadius} meter)."
            );
        }

        // 2. Validasi Batas Waktu Presensi
        $jamBuka = Carbon::createFromTimeString('06:00:00');
        $jamPulangStr = $pengaturan->jam_pulang ? Carbon::createFromTimeString($pengaturan->jam_pulang)->format('H:i:s') : '16:00:00';
        $jamPulang = Carbon::createFromTimeString($jamPulangStr);

        if ($now->lessThan($jamBuka)) {
            return redirect()->back()->with(
                'error', 
                'Absen Ditolak! Waktu presensi belum dibuka. Presensi dibuka mulai pukul 06:00 WIB.'
            );
        }

        if ($now->greaterThan($jamPulang)) {
            return redirect()->back()->with(
                'error', 
                "Absen Ditolak! Waktu presensi hari ini telah berakhir (Batas maksimal: " . Carbon::createFromTimeString($jamPulangStr)->format('H:i') . " WIB)."
            );
        }
        
        // Calculate status (Tepat Waktu vs Terlambat)
        $jamMasukLimit = Carbon::createFromTimeString($pengaturan->jam_masuk)
            ->addMinutes($pengaturan->toleransi_keterlambatan_menit);

        $status = $now->greaterThan($jamMasukLimit) ? 'terlambat' : 'hadir';

        if ($existing) {
            $existing->update([
                'jam_masuk' => $currentTime,
                'status' => $status,
                'latitude_masuk' => $request->latitude,
                'longitude_masuk' => $request->longitude,
                'foto_masuk' => $request->foto,
                'keterangan' => $request->keterangan ?? ($status === 'terlambat' ? 'Terlambat' : 'Hadir tepat waktu'),
            ]);
        } else {
            Presensi::create([
                'user_id' => $user->id,
                'tanggal' => $today,
                'jam_masuk' => $currentTime,
                'status' => $status,
                'latitude_masuk' => $request->latitude,
                'longitude_masuk' => $request->longitude,
                'foto_masuk' => $request->foto,
                'keterangan' => $request->keterangan ?? ($status === 'terlambat' ? 'Terlambat' : 'Hadir tepat waktu'),
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Absen masuk berhasil dicatat! Status: ' . ($status === 'hadir' ? 'Hadir Tepat Waktu' : 'Terlambat'));
    }

    /**
     * Hitung Jarak Menggunakan Rumus Haversine (dalam satuan meter)
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): int
    {
        $earthRadius = 6371000; // Radius bumi dalam meter

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return (int) round($earthRadius * $c);
    }

    /**
     * Riwayat Presensi Pribadi
     */
    public function riwayat(Request $request)
    {
        $user = Auth::user();
        $bulan = $request->input('bulan', Carbon::now()->month);
        $tahun = $request->input('tahun', Carbon::now()->year);

        $query = Presensi::where('user_id', $user->id);

        if ($request->filled('bulan')) {
            $query->whereMonth('tanggal', $bulan);
        }
        if ($request->filled('tahun')) {
            $query->whereYear('tanggal', $tahun);
        }

        $riwayat = $query->orderBy('tanggal', 'desc')->paginate(15);

        // Calculate summary for the filtered period
        $allPeriod = Presensi::where('user_id', $user->id)
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->get();

        $summary = [
            'hadir' => $allPeriod->where('status', 'hadir')->count(),
            'terlambat' => $allPeriod->where('status', 'terlambat')->count(),
            'izin' => $allPeriod->whereIn('status', ['izin', 'cuti'])->count(),
            'alpa' => $allPeriod->where('status', 'alpa')->count(),
        ];

        return Inertia::render('Presensi/Riwayat', [
            'riwayat' => $riwayat,
            'summary' => $summary,
            'filters' => [
                'bulan' => (int) $bulan,
                'tahun' => (int) $tahun,
            ],
        ]);
    }
}
