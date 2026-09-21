<?php

namespace App\Http\Controllers\Api\Leadership;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Services\Leadership\LeadershipAttendanceService;
use App\Services\Leadership\LeadershipDashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadershipAttendanceController extends Controller
{
    protected LeadershipAttendanceService $attendanceService;
    protected LeadershipDashboardService $dashboardService;

    public function __construct(
        LeadershipAttendanceService $attendanceService,
        LeadershipDashboardService $dashboardService
    ) {
        $this->attendanceService = $attendanceService;
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get paginated attendance monitoring list for leadership.
     * GET /api/leadership/attendance
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 15;
        }

        $filters = $request->only([
            'date',
            'start_date',
            'end_date',
            'status',
            'user_id',
            'role',
            'unit',
            'search',
        ]);

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            if ($filters['end_date'] < $filters['start_date']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.',
                    'errors' => ['end_date' => ['Tanggal akhir tidak boleh lebih awal dari tanggal mulai.']],
                ], 422);
            }
        }

        $paginated = $this->attendanceService->getAttendance($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data monitoring absensi pimpinan berhasil diambil.',
            'data' => [
                'items' => AttendanceResource::collection($paginated->items()),
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                    'has_more_pages' => $paginated->hasMorePages(),
                ],
            ],
        ], 200);
    }

    /**
     * Get today's attendance roster with active staff status.
     * GET /api/leadership/attendance/today
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function today(Request $request): JsonResponse
    {
        $date = $request->input('date', Carbon::now()->toDateString());
        $role = $request->input('role', 'all');
        $unit = $request->input('unit', 'all');
        $status = $request->input('status', 'all');
        $search = $request->input('search', '');

        $dashboardData = $this->dashboardService->getDashboardData($date, $role, $unit, $status, $search);

        return response()->json([
            'success' => true,
            'message' => 'Data absensi hari ini berhasil diambil.',
            'data' => [
                'date' => $date,
                'items' => $dashboardData['attendance_today'],
            ],
        ], 200);
    }

    /**
     * Alias for paginated attendance history.
     * GET /api/leadership/attendance/history
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function history(Request $request): JsonResponse
    {
        return $this->index($request);
    }

    /**
     * Get monthly statistical summary.
     * GET /api/leadership/attendance/summary
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function summary(Request $request): JsonResponse
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);
        $role = $request->input('role', 'all');
        $unit = $request->input('unit', 'all');

        $summary = $this->attendanceService->getSummary($month, $year, $role, $unit);

        return response()->json([
            'success' => true,
            'message' => 'Rekap absensi bulanan pimpinan berhasil diambil.',
            'data' => $summary,
        ], 200);
    }
}
