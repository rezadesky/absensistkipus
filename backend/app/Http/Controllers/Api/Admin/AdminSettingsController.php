<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\WorkDay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    /**
     * Get all work day configurations.
     * GET /api/admin/work-days
     */
    public function getWorkDays(): JsonResponse
    {
        $workDays = WorkDay::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan hari kerja berhasil diambil.',
            'data' => $workDays,
        ], 200);
    }

    /**
     * Update work days status.
     * PUT /api/admin/work-days
     */
    public function updateWorkDays(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'days' => 'required|array',
            'days.*.id' => 'required|exists:work_days,id',
            'days.*.is_active' => 'required|boolean',
        ]);

        foreach ($validated['days'] as $item) {
            WorkDay::where('id', $item['id'])->update(['is_active' => $item['is_active']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan hari kerja berhasil diperbarui.',
            'data' => WorkDay::orderBy('id', 'asc')->get(),
        ], 200);
    }

    /**
     * Get list of holidays.
     * GET /api/admin/holidays
     */
    public function getHolidays(Request $request): JsonResponse
    {
        $year = $request->input('year', now()->year);
        $holidays = Holiday::whereYear('date', $year)->orderBy('date', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar hari libur berhasil diambil.',
            'data' => $holidays,
        ], 200);
    }

    /**
     * Add a new holiday.
     * POST /api/admin/holidays
     */
    public function storeHoliday(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d|unique:holidays,date',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $holiday = Holiday::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hari libur berhasil ditambahkan.',
            'data' => $holiday,
        ], 201);
    }

    /**
     * Delete a holiday.
     * DELETE /api/admin/holidays/{id}
     */
    public function destroyHoliday(int $id): JsonResponse
    {
        $holiday = Holiday::find($id);
        if (!$holiday) {
            return response()->json([
                'success' => false,
                'message' => 'Hari libur tidak ditemukan.',
                'errors' => (object) [],
            ], 404);
        }

        $holiday->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hari libur berhasil dihapus.',
            'data' => null,
        ], 200);
    }
}
