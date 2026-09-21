<?php

namespace App\Http\Controllers\Api\Leadership;

use App\Http\Controllers\Controller;
use App\Services\Leadership\LeadershipReportService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadershipReportController extends Controller
{
    protected LeadershipReportService $reportService;

    public function __construct(LeadershipReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Get attendance report summary across date range.
     * GET /api/leadership/reports/attendance
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function attendance(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        if ($endDate < $startDate) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.',
                'errors' => ['end_date' => ['Tanggal akhir tidak boleh lebih awal dari tanggal mulai.']],
            ], 422);
        }

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'role' => $request->input('role', 'all'),
            'unit' => $request->input('unit', 'all'),
        ];

        $report = $this->reportService->getAttendanceReport($filters);

        return response()->json([
            'success' => true,
            'message' => 'Laporan kehadiran pimpinan berhasil diambil.',
            'data' => $report,
        ], 200);
    }

    /**
     * Get leave report summary across date range.
     * GET /api/leadership/reports/leave
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function leave(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        if ($endDate < $startDate) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.',
                'errors' => ['end_date' => ['Tanggal akhir tidak boleh lebih awal dari tanggal mulai.']],
            ], 422);
        }

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'role' => $request->input('role', 'all'),
            'type' => $request->input('type', 'all'),
            'unit' => $request->input('unit', 'all'),
        ];

        $report = $this->reportService->getLeaveReport($filters);

        return response()->json([
            'success' => true,
            'message' => 'Laporan pengajuan izin pimpinan berhasil diambil.',
            'data' => $report,
        ], 200);
    }
}
