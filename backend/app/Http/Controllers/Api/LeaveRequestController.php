<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\LeaveRequestException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaveRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Services\LeaveRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    protected LeaveRequestService $leaveRequestService;

    public function __construct(LeaveRequestService $leaveRequestService)
    {
        $this->leaveRequestService = $leaveRequestService;
    }

    /**
     * Get list of leave requests for the authenticated user (Dosen / Tendik).
     * GET /api/leave
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

        $paginated = $this->leaveRequestService->getUserLeaveRequests(
            $request->user(),
            $perPage,
            $request->only(['status', 'type'])
        );

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan izin berhasil diambil.',
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
     * Create a new leave request.
     * POST /api/leave
     *
     * @param  StoreLeaveRequest  $request
     * @return JsonResponse
     */
    public function store(StoreLeaveRequest $request): JsonResponse
    {
        try {
            $leaveRequest = $this->leaveRequestService->create(
                $request->user(),
                $request->validated(),
                $request->file('attachment')
            );

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan izin berhasil dibuat.',
                'data' => new LeaveRequestResource($leaveRequest),
            ], 201);
        } catch (LeaveRequestException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => empty($e->getErrors()) ? (object) [] : $e->getErrors(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses pengajuan izin.',
                'errors' => ['error' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Get detail of a specific leave request owned by user.
     * GET /api/leave/{id}
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $leaveRequest = $this->leaveRequestService->getUserLeaveRequestDetail($request->user(), $id);

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
                'message' => 'Terjadi kesalahan saat mengambil detail pengajuan izin.',
                'errors' => ['error' => [$e->getMessage()]],
            ], 500);
        }
    }
}
