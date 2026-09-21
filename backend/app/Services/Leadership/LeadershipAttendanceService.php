<?php

namespace App\Services\Leadership;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LeadershipAttendanceService
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
     * Get paginated attendance history for leadership.
     *
     * @param  array  $filters
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function getAttendance(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Attendance::with(['user.employee'])
            ->whereHas('user', function ($q) {
                $q->whereIn('role', ['dosen', 'tendik']);
            })
            ->orderBy('attendance_date', 'desc')
            ->orderBy('id', 'desc');

        if (!empty($filters['date'])) {
            $query->whereDate('attendance_date', $filters['date']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('attendance_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('attendance_date', '<=', $filters['end_date']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['role']) && $filters['role'] !== 'all') {
            $role = $filters['role'];
            $query->whereHas('user', function ($q) use ($role) {
                $q->where('role', $role);
            });
        }

        if (!empty($filters['unit']) && $filters['unit'] !== 'all') {
            $unit = $filters['unit'];
            $query->whereHas('user.employee', function ($q) use ($unit) {
                $q->where('department', $unit);
            });
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('employee_number', 'like', "%{$search}%");
                  });
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get monthly summary statistics and percentage of attendance.
     *
     * @param  int  $month
     * @param  int  $year
     * @param  string|null  $role
     * @param  string|null  $unit
     * @return array
     */
    public function getSummary(int $month, int $year, ?string $role = 'all', ?string $unit = 'all'): array
    {
        $baseQuery = Attendance::whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->whereHas('user', function ($q) use ($role, $unit) {
                $q->whereIn('role', ['dosen', 'tendik'])->where('status', 'active');
                if ($role && $role !== 'all') {
                    $q->where('role', $role);
                }
                if ($unit && $unit !== 'all') {
                    $q->whereHas('employee', function ($eq) use ($unit) {
                        $eq->where('department', $unit);
                    });
                }
            });

        $totalHadir = (clone $baseQuery)->where('status', 'hadir')->count();
        $totalIzin = (clone $baseQuery)->where('status', 'izin')->count();
        $totalRecord = (clone $baseQuery)->count();

        // Count total active employees
        $userQuery = User::whereIn('role', ['dosen', 'tendik'])->where('status', 'active');
        if ($role && $role !== 'all') {
            $userQuery->where('role', $role);
        }
        if ($unit && $unit !== 'all') {
            $userQuery->whereHas('employee', function ($q) use ($unit) {
                $q->where('department', $unit);
            });
        }

        $totalDosen = User::where('role', 'dosen')->where('status', 'active')->count();
        $totalTendik = User::where('role', 'tendik')->where('status', 'active')->count();
        $totalPegawai = $userQuery->count();

        // Calculate active work days in this month
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = (clone $startDate)->endOfMonth();
        $period = CarbonPeriod::create($startDate, $endDate);

        $activeWorkDays = WorkDay::where('is_active', true)->pluck('day')->toArray();
        $holidays = Holiday::whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        $workDaysCount = 0;
        foreach ($period as $dt) {
            $dayName = $this->dayNames[$dt->dayOfWeekIso] ?? 'senin';
            $dtStr = $dt->toDateString();
            if (in_array($dayName, $activeWorkDays) && !in_array($dtStr, $holidays)) {
                $workDaysCount++;
            }
        }

        $totalPotentialAttendance = $totalPegawai * max(1, $workDaysCount);
        $persentaseKehadiran = $totalPotentialAttendance > 0 
            ? round(($totalHadir / $totalPotentialAttendance) * 100, 1) 
            : 0;

        return [
            'month' => $month,
            'year' => $year,
            'total_pegawai' => $totalPegawai,
            'total_hadir' => $totalHadir,
            'total_izin' => $totalIzin,
            'total_record' => $totalRecord,
            'work_days_count' => $workDaysCount,
            'persentase_kehadiran' => $persentaseKehadiran,
            'active_employees' => [
                'dosen' => $totalDosen,
                'tendik' => $totalTendik,
                'total' => $totalDosen + $totalTendik,
            ],
        ];
    }
}
