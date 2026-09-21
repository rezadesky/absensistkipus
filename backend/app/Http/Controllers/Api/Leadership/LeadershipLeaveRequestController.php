<?php

namespace App\Http\Controllers\Api\Leadership;

use App\Exceptions\LeaveRequestException;
use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Services\LeaveRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadershipLeaveRequestController extends Controller
{
    protected LeaveRequestService $leaveRequestService;

    public function __construct(LeaveRequestService $leaveRequestService)
    {
        $this->leaveRequestService = $leaveRequestService;
    }

    /**
     * Get paginated list of all leave requests (Leadership - Read only).
     * GET /api/leadership/leave
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 10);
        if ($perPage < 1) {
            $perPage = 10;
        }

        $filters = $request->only(['status', 'type', 'user_id', 'start_date', 'end_date']);
        $paginated = $this->leaveRequestService->getAllLeaveRequests($perPage, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Data pengajuan izin pimpinan berhasil diambil.',
            'data' => [
                'items' => LeaveRequestResource::collection($paginated->items()),
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
     * Get detail of a specific leave request (Leadership - Read only).
     * GET /api/leadership/leave/{id}
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $leaveRequest = $this->leaveRequestService->getLeaveRequestDetail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail pengajuan izin pimpinan berhasil diambil.',
                'data' => new LeaveRequestResource($leaveRequest),
            ], 200);
        } catch (LeaveRequestException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => empty($e->getErrors()) ? (object) [] : $e->getErrors(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data pengajuan izin.',
                'errors' => ['error' => [$e->getMessage()]],
            ], 500);
        }
    }
}
