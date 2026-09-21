<?php

namespace App\Services\Leadership;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class LeadershipReportService
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
     * Get attendance report summary across custom date range.
     *
     * @param  array  $filters
     * @return array
     */
    public function getAttendanceReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? Carbon::now()->toDateString();
        $role = $filters['role'] ?? 'all';
        $unit = $filters['unit'] ?? 'all';

        // Count working days in date range excluding holidays
        $period = CarbonPeriod::create($startDate, $endDate);
        $activeWorkDays = WorkDay::where('is_active', true)->pluck('day')->toArray();
        $holidays = Holiday::whereBetween('date', [$startDate, $endDate])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        $workingDaysCount = 0;
        foreach ($period as $dt) {
            $dayName = $this->dayNames[$dt->dayOfWeekIso] ?? 'senin';
            $dtStr = $dt->toDateString();
            if (in_array($dayName, $activeWorkDays) && !in_array($dtStr, $holidays)) {
                $workingDaysCount++;
            }
        }

        // Base user query for active staff
        $userQuery = User::whereIn('role', ['dosen', 'tendik'])->where('status', 'active');
        if ($role !== 'all' && !empty($role)) {
            $userQuery->where('role', $role);
        }
        if ($unit !== 'all' && !empty($unit)) {
            $userQuery->whereHas('employee', function ($q) use ($unit) {
                $q->where('department', $unit);
            });
        }

        $totalPegawai = $userQuery->count();
        $totalDosen = (clone $userQuery)->where('role', 'dosen')->count();
        $totalTendik = (clone $userQuery)->where('role', 'tendik')->count();

        // Base attendance query
        $attendanceQuery = Attendance::whereBetween('attendance_date', [$startDate, $endDate])
            ->whereHas('user', function ($q) use ($role, $unit) {
                $q->whereIn('role', ['dosen', 'tendik'])->where('status', 'active');
                if ($role !== 'all' && !empty($role)) {
                    $q->where('role', $role);
                }
                if ($unit !== 'all' && !empty($unit)) {
                    $q->whereHas('employee', function ($eq) use ($unit) {
                        $eq->where('department', $unit);
                    });
                }
            });

        $totalHadir = (clone $attendanceQuery)->where('status', 'hadir')->count();
        $totalIzin = (clone $attendanceQuery)->where('status', 'izin')->count();

        // Total expected attendance slots
        $totalSlots = $totalPegawai * $workingDaysCount;
        $totalTidakHadir = max(0, $totalSlots - $totalHadir - $totalIzin);
        $persentaseKehadiran = $totalSlots > 0 ? round(($totalHadir / $totalSlots) * 100, 1) : 0;

        // Breakdown by role
        $dosenAttQuery = (clone $attendanceQuery)->whereHas('user', fn($q) => $q->where('role', 'dosen'));
        $tendikAttQuery = (clone $attendanceQuery)->whereHas('user', fn($q) => $q->where('role', 'tendik'));

        $dosenHadir = (clone $dosenAttQuery)->where('status', 'hadir')->count();
        $dosenIzin = (clone $dosenAttQuery)->where('status', 'izin')->count();
        $dosenSlots = $totalDosen * $workingDaysCount;
        $dosenPercentage = $dosenSlots > 0 ? round(($dosenHadir / $dosenSlots) * 100, 1) : 0;

        $tendikHadir = (clone $tendikAttQuery)->where('status', 'hadir')->count();
        $tendikIzin = (clone $tendikAttQuery)->where('status', 'izin')->count();
        $tendikSlots = $totalTendik * $workingDaysCount;
        $tendikPercentage = $tendikSlots > 0 ? round(($tendikHadir / $tendikSlots) * 100, 1) : 0;

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'working_days_count' => $workingDaysCount,
            ],
            'total_pegawai' => $totalPegawai,
            'total_hadir' => $totalHadir,
            'total_izin' => $totalIzin,
            'total_tidak_hadir' => $totalTidakHadir,
            'attendance_percentage' => $persentaseKehadiran,
            'breakdown_by_role' => [
                'dosen' => [
                    'total' => $totalDosen,
                    'hadir' => $dosenHadir,
                    'izin' => $dosenIzin,
                    'percentage' => $dosenPercentage,
                ],
                'tendik' => [
                    'total' => $totalTendik,
                    'hadir' => $tendikHadir,
                    'izin' => $tendikIzin,
                    'percentage' => $tendikPercentage,
                ],
            ],
        ];
    }

    /**
     * Get leave report summary across date range.
     *
     * @param  array  $filters
     * @return array
     */
    public function getLeaveReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? Carbon::now()->toDateString();
        $role = $filters['role'] ?? 'all';
        $type = $filters['type'] ?? 'all';
        $unit = $filters['unit'] ?? 'all';

        $query = LeaveRequest::where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate]);
        })
        ->whereHas('user', function ($q) use ($role, $unit) {
            if ($role !== 'all' && !empty($role)) {
                $q->where('role', $role);
            }
            if ($unit !== 'all' && !empty($unit)) {
                $q->whereHas('employee', function ($eq) use ($unit) {
                    $eq->where('department', $unit);
                });
            }
        });

        if ($type !== 'all' && !empty($type)) {
            $query->where('type', $type);
        }

        $totalPengajuan = (clone $query)->count();
        $menunggu = (clone $query)->where('status', 'menunggu')->count();
        $disetujui = (clone $query)->where('status', 'disetujui')->count();
        $ditolak = (clone $query)->where('status', 'ditolak')->count();

        // Breakdown by type
        $cuti = (clone $query)->where('type', 'cuti')->count();
        $izin = (clone $query)->where('type', 'izin')->count();
        $sakit = (clone $query)->where('type', 'sakit')->count();
        $dinasLuar = (clone $query)->where('type', 'dinas_luar')->count();

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'total_pengajuan' => $totalPengajuan,
            'status_counts' => [
                'menunggu' => $menunggu,
                'disetujui' => $disetujui,
                'ditolak' => $ditolak,
            ],
            'type_counts' => [
                'cuti' => $cuti,
                'izin' => $izin,
                'sakit' => $sakit,
                'dinas_luar' => $dinasLuar,
            ],
        ];
    }
}
