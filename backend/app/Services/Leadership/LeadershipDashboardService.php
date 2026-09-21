<?php

namespace App\Services\Leadership;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;

class LeadershipDashboardService
{
    /**
     * Map of ISO day of week to Indonesian day name.
     */
    protected array $dayNames = [
        1 => 'senin',
        2 => 'selasa',
        3 => 'rabu',
        4 => 'kamis',
        5 => 'jumat',
        6 => 'sabtu',
        7 => 'minggu',
    ];

    /**
     * Get dashboard metrics and list for leadership.
     *
     * @param  string  $date
     * @param  string|null  $role
     * @param  string|null  $unit
     * @param  string|null  $status
     * @param  string|null  $search
     * @return array
     */
    public function getDashboardData(
        string $date,
        ?string $role = 'all',
        ?string $unit = 'all',
        ?string $status = 'all',
        ?string $search = ''
    ): array {
        $parsedDate = Carbon::parse($date);
        $dayName = $this->dayNames[$parsedDate->dayOfWeekIso] ?? 'senin';

        // 1. Check working day & holiday status
        $workDay = WorkDay::where('day', $dayName)->first();
        $isWorkDay = (bool) ($workDay && $workDay->is_active);
        $holiday = Holiday::where('date', $date)->first();
        $isHoliday = !is_null($holiday);

        // 2. Count total active Dosen and Tendik
        $totalDosen = User::where('role', 'dosen')->where('status', 'active')->count();
        $totalTendik = User::where('role', 'tendik')->where('status', 'active')->count();
        $totalActiveStaff = $totalDosen + $totalTendik;

        // 3. Count attendances on the given date for active dosen & tendik
        $baseAttendanceQuery = Attendance::whereDate('attendance_date', $date)
            ->whereHas('user', function ($q) {
                $q->whereIn('role', ['dosen', 'tendik'])->where('status', 'active');
            });

        $hadirHariIni = (clone $baseAttendanceQuery)->where('status', 'hadir')->count();
        $izinHariIni = (clone $baseAttendanceQuery)->where('status', 'izin')->count();

        // 4. Calculate 'belum_absen' based on working day rules
        $belumAbsen = 0;
        if ($isWorkDay && !$isHoliday) {
            $belumAbsen = max(0, $totalActiveStaff - $hadirHariIni - $izinHariIni);
        }

        // 5. Fetch attendance list for active staff
        $userQuery = User::with(['employee', 'attendances' => function ($q) use ($date) {
            $q->whereDate('attendance_date', $date);
        }])
        ->whereIn('role', ['dosen', 'tendik'])
        ->where('status', 'active');

        if ($role && $role !== 'all' && in_array($role, ['dosen', 'tendik'])) {
            $userQuery->where('role', $role);
        }

        if ($unit && $unit !== 'all') {
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

        $attendanceList = $users->map(function ($user) use ($date, $isWorkDay, $isHoliday) {
            $attendance = $user->attendances->first();
            $employee = $user->employee;

            $attStatus = 'belum_absen';
            $checkInFormatted = null;

            if ($attendance) {
                $attStatus = $attendance->status;
                if ($attendance->check_in) {
                    $checkInFormatted = Carbon::parse($attendance->check_in)->format('H:i') . ' WIB';
                }
            } elseif (!$isWorkDay || $isHoliday) {
                $attStatus = 'libur';
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

        if ($status && $status !== 'all') {
            $attendanceList = $attendanceList->filter(function ($item) use ($status) {
                return $item['status'] === $status;
            })->values();
        }

        return [
            'stats' => [
                'total_dosen' => $totalDosen,
                'total_tendik' => $totalTendik,
                'hadir_hari_ini' => $hadirHariIni,
                'izin_hari_ini' => $izinHariIni,
                'belum_absen' => $belumAbsen,
            ],
            'date' => $date,
            'is_work_day' => $isWorkDay,
            'is_holiday' => $isHoliday,
            'holiday_name' => $holiday?->name,
            'attendance_today' => $attendanceList,
        ];
    }
}
