<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\LeaveRequestException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveLeaveRequest;
use App\Http\Requests\RejectLeaveRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Services\LeaveRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLeaveRequestController extends Controller
{
    protected LeaveRequestService $leaveRequestService;

    public function __construct(LeaveRequestService $leaveRequestService)
    {
        $this->leaveRequestService = $leaveRequestService;
    }

    /**
     * Get all leave requests with optional filters (Admin).
     * GET /api/admin/leave
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
            'message' => 'Daftar semua pengajuan izin berhasil diambil.',
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
     * Get detail of a specific leave request (Admin).
     * GET /api/admin/leave/{id}
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
                'message' => 'Detail pengajuan izin berhasil diambil.',
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

    /**
     * Approve a leave request (Admin).
     * POST /api/admin/leave/{id}/approve
     *
     * @param  ApproveLeaveRequest  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function approve(ApproveLeaveRequest $request, int $id): JsonResponse
    {
        try {
            $leaveRequest = $this->leaveRequestService->approve(
                $request->user(),
                $id,
                $request->input('review_note')
            );

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan izin berhasil disetujui.',
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
                'message' => 'Terjadi kesalahan saat menyetujui pengajuan izin.',
                'errors' => ['error' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Reject a leave request (Admin).
     * POST /api/admin/leave/{id}/reject
     *
     * @param  RejectLeaveRequest  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function reject(RejectLeaveRequest $request, int $id): JsonResponse
    {
        try {
            $leaveRequest = $this->leaveRequestService->reject(
                $request->user(),
                $id,
                $request->input('review_note')
            );

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan izin berhasil ditolak.',
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
                'message' => 'Terjadi kesalahan saat menolak pengajuan izin.',
                'errors' => ['error' => [$e->getMessage()]],
            ], 500);
        }
    }
}
