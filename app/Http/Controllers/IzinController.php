<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PengajuanIzin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class IzinController extends Controller
{
    /**
     * Display list of user's leave/permission requests
     */
    public function index()
    {
        $user = Auth::user();
        $pengajuan = PengajuanIzin::where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Izin/Index', [
            'pengajuan' => $pengajuan,
        ]);
    }

    /**
     * Show form for creating leave/permission request
     */
    public function create()
    {
        return Inertia::render('Izin/Create');
    }

    /**
     * Store new leave request
     */
    public function store(Request $request)
    {
        $request->validate([
            'jenis_izin' => 'required|in:sakit,keperluan_pribadi,dinas_luar,cuti_tahunan',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'keterangan' => 'required|string|max:1000',
            'lampiran' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
        ]);

        $lampiranPath = null;
        if ($request->hasFile('lampiran')) {
            $lampiranPath = $request->file('lampiran')->store('lampiran_izin', 'public');
        }

        PengajuanIzin::create([
            'user_id' => Auth::id(),
            'jenis_izin' => $request->jenis_izin,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'keterangan' => $request->keterangan,
            'lampiran' => $lampiranPath,
            'status' => 'menunggu',
        ]);

        return redirect()->route('izin.index')->with('success', 'Permohonan izin/cuti berhasil diajukan dan sedang menunggu persetujuan Admin/Pimpinan.');
    }

    /**
     * Admin: List all leave requests for approval
     */
    public function adminIndex(Request $request)
    {
        $status = $request->input('status', 'semua');
        $query = PengajuanIzin::with(['user', 'approver']);

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        $pengajuan = $query->latest()->paginate(15);

        return Inertia::render('Admin/Izin/Index', [
            'pengajuan' => $pengajuan,
            'statusFilter' => $status,
        ]);
    }

    /**
     * Admin: Approve or Reject leave request
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:disetujui,ditolak',
            'catatan_admin' => 'nullable|string|max:500',
        ]);

        $izin = PengajuanIzin::findOrFail($id);
        $izin->update([
            'status' => $request->status,
            'catatan_admin' => $request->catatan_admin,
            'approved_by' => Auth::id(),
        ]);

        // Auto-sinkronisasi status ke tabel Presensi jika disetujui
        if ($request->status === 'disetujui') {
            $start = \Carbon\Carbon::parse($izin->tanggal_mulai);
            $end = \Carbon\Carbon::parse($izin->tanggal_selesai);
            $labelJenis = ucfirst(str_replace('_', ' ', $izin->jenis_izin));

            while ($start->lte($end)) {
                \App\Models\Presensi::updateOrCreate(
                    [
                        'user_id' => $izin->user_id,
                        'tanggal' => $start->toDateString(),
                    ],
                    [
                        'status' => in_array($izin->jenis_izin, ['sakit', 'keperluan_pribadi', 'dinas_luar']) ? 'izin' : 'cuti',
                        'keterangan' => "Izin Disetujui: {$labelJenis} ({$izin->keterangan})",
                    ]
                );
                $start->addDay();
            }
        }

        return redirect()->back()->with('success', 'Status permohonan izin berhasil diperbarui menjadi: ' . ucfirst($request->status));
    }
}
