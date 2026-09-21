<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAttendanceController extends Controller
{
    /**
     * Get real-time today attendance list for Admin.
     * GET /api/admin/attendance/today
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

        $query = User::with(['employee', 'attendances' => function ($q) use ($date) {
            $q->whereDate('attendance_date', $date);
        }])
        ->whereIn('role', ['dosen', 'tendik'])
        ->where('status', 'active');

        if ($role !== 'all' && !empty($role)) {
            $query->where('role', $role);
        }

        if ($unit !== 'all' && !empty($unit)) {
            $query->whereHas('employee', function ($q) use ($unit) {
                $q->where('department', $unit);
            });
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('employee_number', 'like', "%{$search}%");
                  });
            });
        }

        $users = $query->orderBy('name', 'asc')->get();

        $items = $users->map(function ($user) use ($date) {
            $att = $user->attendances->first();
            $emp = $user->employee;

            $attStatus = $att ? $att->status : 'belum_absen';
            $checkInTime = $att?->check_in ? Carbon::parse($att->check_in)->format('H:i') . ' WIB' : null;

            return [
                'id' => $att ? $att->id : 'usr-' . $user->id,
                'user_id' => $user->id,
                'name' => $user->name,
                'nip' => $emp?->employee_number ?? '-',
                'role' => ucfirst($user->role),
                'unit' => $emp?->department ?? ($user->role === 'dosen' ? 'Dosen' : 'Tendik'),
                'attendance_date' => $date,
                'check_in_time' => $checkInTime,
                'status' => $attStatus,
                'notes' => $att?->notes,
            ];
        });

        if ($status !== 'all' && !empty($status)) {
            $items = $items->filter(fn($i) => $i['status'] === $status)->values();
        }

        return response()->json([
            'success' => true,
            'message' => 'Data absensi hari ini berhasil diambil.',
            'data' => [
                'date' => $date,
                'items' => $items,
            ],
        ], 200);
    }

    /**
     * Get paginated attendance history with advanced filtering.
     * GET /api/admin/attendance/history
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

        $query = Attendance::with(['user.employee'])
            ->orderBy('attendance_date', 'desc')
            ->orderBy('id', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('attendance_date', $request->input('date'));
        }

        if ($request->filled('start_date')) {
            $query->whereDate('attendance_date', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('attendance_date', '<=', $request->input('end_date'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $role = $request->input('role');
            $query->whereHas('user', function ($q) use ($role) {
                $q->where('role', $role);
            });
        }

        if ($request->filled('unit') && $request->input('unit') !== 'all') {
            $unit = $request->input('unit');
            $query->whereHas('user.employee', function ($q) use ($unit) {
                $q->where('department', $unit);
            });
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('employee_number', 'like', "%{$search}%");
                  });
            });
        }

        $paginated = $query->paginate($perPage);

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
                    'has_more_pages' => $paginated->hasMorePages(),
                ],
            ],
        ], 200);
    }

    /**
     * Get attendance statistical recap and percentage summary.
     * GET /api/admin/attendance/summary
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function summary(Request $request): JsonResponse
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $baseQuery = Attendance::whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month);

        $totalHadir = (clone $baseQuery)->where('status', 'hadir')->count();
        $totalIzin = (clone $baseQuery)->where('status', 'izin')->count();
        $totalRecord = (clone $baseQuery)->count();

        $totalDosen = User::where('role', 'dosen')->where('status', 'active')->count();
        $totalTendik = User::where('role', 'tendik')->where('status', 'active')->count();

        return response()->json([
            'success' => true,
            'message' => 'Rekap absensi bulanan berhasil diambil.',
            'data' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'total_hadir' => $totalHadir,
                'total_izin' => $totalIzin,
                'total_record' => $totalRecord,
                'active_employees' => [
                    'dosen' => $totalDosen,
                    'tendik' => $totalTendik,
                    'total' => $totalDosen + $totalTendik,
                ],
            ],
        ], 200);
    }
}
