<?php

namespace App\Http\Controllers\Api\Leadership;

use App\Http\Controllers\Controller;
use App\Services\Leadership\LeadershipDashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadershipDashboardController extends Controller
{
    protected LeadershipDashboardService $dashboardService;

    public function __construct(LeadershipDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get dashboard summary stats and today's attendance for leadership.
     * GET /api/leadership/dashboard
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $date = $request->input('date', Carbon::now()->toDateString());
        $role = $request->input('role', 'all');
        $unit = $request->input('unit', 'all');
        $status = $request->input('status', 'all');
        $search = $request->input('search', '');

        $data = $this->dashboardService->getDashboardData($date, $role, $unit, $status, $search);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard pimpinan berhasil dimuat.',
            'data' => $data,
        ], 200);
    }
}
