<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AttendanceException;
use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    protected AttendanceService $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Get today's attendance status for authenticated user.
     * GET /api/attendance/today
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function today(Request $request): JsonResponse
    {
        $result = $this->attendanceService->getTodayAttendance($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Data absensi hari ini berhasil diambil.',
            'data' => [
                'attendance' => $result['attendance'] ? new AttendanceResource($result['attendance']) : null,
                'has_checked_in' => $result['has_checked_in'],
                'server_date' => $result['server_date'],
                'server_time' => $result['server_time'],
                'day_name' => $result['day_name'],
                'is_work_day' => $result['is_work_day'],
                'is_holiday' => $result['is_holiday'],
                'holiday_name' => $result['holiday_name'],
            ],
        ], 200);
    }

    /**
     * Perform check-in for authenticated user.
     * POST /api/attendance/check-in
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function checkIn(Request $request): JsonResponse
    {
        try {
            $attendance = $this->attendanceService->checkIn($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Absensi berhasil dicatat.',
                'data' => new AttendanceResource($attendance),
            ], 201);
        } catch (AttendanceException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => empty($e->getErrors()) ? (object) [] : $e->getErrors(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses absensi.',
                'errors' => ['error' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Get paginated attendance history for authenticated user.
     * GET /api/attendance/history
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function history(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 15;
        }

        $paginated = $this->attendanceService->getHistory(
            $request->user(),
            $perPage,
            $request->only(['month', 'year', 'status'])
        );

        return response()->json([
            'success' => true,
            'message' => 'Riwayat absensi berhasil diambil.',
            'data' => [
                'items' => AttendanceResource::collection($paginated->items()),
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                    'from' => $paginated->firstItem(),
                    'to' => $paginated->lastItem(),
                    'has_more_pages' => $paginated->hasMorePages(),
                ],
            ],
        ], 200);
    }
}
