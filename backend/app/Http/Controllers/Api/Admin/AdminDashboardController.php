<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard summary stats and today's attendance data for Admin.
     * GET /api/admin/dashboard
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

        // 1. Core Summary Metrics (Optimized aggregations)
        $totalDosen = User::where('role', 'dosen')->where('status', 'active')->count();
        $totalTendik = User::where('role', 'tendik')->where('status', 'active')->count();

        // Calculate attendance stats for the given date across dosen & tendik
        $baseAttendanceQuery = Attendance::whereDate('attendance_date', $date)
            ->whereHas('user', function ($q) {
                $q->whereIn('role', ['dosen', 'tendik'])->where('status', 'active');
            });

        $hadirHariIni = (clone $baseAttendanceQuery)->where('status', 'hadir')->count();
        $izinHariIni = (clone $baseAttendanceQuery)->where('status', 'izin')->count();

        $totalActiveStaff = $totalDosen + $totalTendik;
        $belumAbsen = max(0, $totalActiveStaff - $hadirHariIni - $izinHariIni);

        // 2. Fetch list of users with attendance info for the given date
        $userQuery = User::with(['employee', 'attendances' => function ($q) use ($date) {
            $q->whereDate('attendance_date', $date);
        }])
        ->whereIn('role', ['dosen', 'tendik'])
        ->where('status', 'active');

        if ($role !== 'all' && in_array($role, ['dosen', 'tendik'])) {
            $userQuery->where('role', $role);
        }

        if ($unit !== 'all' && !empty($unit)) {
            $userQuery->whereHas('employee', function ($q) use ($unit) {
                $q->where('department', $unit);
            });
        }

        if (!empty($search)) {
            $userQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('employee_number', 'like', "%{$search}%");
                  });
            });
        }

        $users = $userQuery->orderBy('name', 'asc')->get();

        $attendanceList = $users->map(function ($user) {
            $attendance = $user->attendances->first();
            $employee = $user->employee;

            $attStatus = 'belum_absen';
            $checkInFormatted = null;

            if ($attendance) {
                $attStatus = $attendance->status;
                if ($attendance->check_in) {
                    $checkInFormatted = Carbon::parse($attendance->check_in)->format('H:i') . ' WIB';
                }
            }

            return [
                'id' => $attendance ? 'att-' . $attendance->id : 'usr-' . $user->id,
                'attendance_id' => $attendance?->id,
                'user_id' => $user->id,
                'name' => $user->name,
                'nip' => $employee?->employee_number ?? '-',
                'role' => ucfirst($user->role),
                'unit' => $employee?->department ?? ($user->role === 'dosen' ? 'Dosen' : 'Tendik'),
                'position' => $employee?->position ?? '-',
                'check_in' => $checkInFormatted,
                'status' => $attStatus,
                'notes' => $attendance?->notes,
            ];
        });

        if ($status !== 'all' && !empty($status)) {
            $attendanceList = $attendanceList->filter(function ($item) use ($status) {
                return $item['status'] === $status;
            })->values();
        }

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard admin berhasil diambil.',
            'data' => [
                'stats' => [
                    'total_dosen' => $totalDosen,
                    'total_tendik' => $totalTendik,
                    'hadir_hari_ini' => $hadirHariIni,
                    'belum_absen' => $belumAbsen,
                    'izin' => $izinHariIni,
                ],
                'date' => $date,
                'attendance_today' => $attendanceList,
            ],
        ], 200);
    }
}
