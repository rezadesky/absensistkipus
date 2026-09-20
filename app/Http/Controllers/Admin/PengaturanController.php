<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PengaturanAbsensi;

class PengaturanController extends Controller
{
    /**
     * Display current geofencing and work schedule settings
     */
    public function index()
    {
        $pengaturan = PengaturanAbsensi::first();
        if (!$pengaturan) {
            $pengaturan = PengaturanAbsensi::create([
                'nama_instansi' => 'STKIP Usman Safri Kutacane',
                'latitude' => 3.486250,
                'longitude' => 97.809167,
                'radius_meter' => 200,
                'jam_masuk' => '08:00:00',
                'toleransi_keterlambatan_menit' => 15,
                'jam_pulang' => '16:00:00',
                'wajib_foto' => true,
            ]);
        }

        return Inertia::render('Admin/Pengaturan/Index', [
            'pengaturan' => $pengaturan,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $request->validate([
            'nama_instansi' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_meter' => 'required|integer|min:10|max:5000',
            'jam_masuk' => 'required',
            'toleransi_keterlambatan_menit' => 'required|integer|min:0|max:120',
            'jam_pulang' => 'required',
            'wajib_foto' => 'required|boolean',
        ]);

        $pengaturan = PengaturanAbsensi::first();
        $pengaturan->update($request->all());

        return redirect()->back()->with('success', 'Pengaturan absensi dan geofencing berhasil diperbarui.');
    }
}
