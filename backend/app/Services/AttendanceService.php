<?php

namespace App\Services;

use App\Exceptions\AttendanceException;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    /**
     * Map of ISO day of week (1 = Monday, 7 = Sunday) to Indonesian day name.
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
     * Get Indonesian day name for a Carbon date instance.
     */
    public function getDayName(Carbon $date): string
    {
        return $this->dayNames[$date->dayOfWeekIso] ?? 'senin';
    }

    /**
     * Get today's attendance status and server information for the user.
     *
     * @param  User  $user
     * @param  Carbon|null  $customNow (Optional for testing/mocking)
     * @return array
     */
    public function getTodayAttendance(User $user, ?Carbon $customNow = null): array
    {
        $now = $customNow ?? Carbon::now();
        $todayDate = $now->toDateString();
        $dayName = $this->getDayName($now);

        $workDay = WorkDay::where('day', $dayName)->first();
        $holiday = Holiday::where('date', $todayDate)->first();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('attendance_date', $todayDate)
            ->first();

        return [
            'attendance' => $attendance,
            'has_checked_in' => !is_null($attendance),
            'server_date' => $todayDate,
            'server_time' => $now->format('H:i:s'),
            'day_name' => $dayName,
            'is_work_day' => (bool) ($workDay && $workDay->is_active),
            'is_holiday' => !is_null($holiday),
            'holiday_name' => $holiday?->name,
        ];
    }

    /**
     * Perform check-in for the given authenticated user.
     *
     * @param  User  $user
     * @param  Carbon|null  $customNow (Optional for testing/mocking)
     * @return Attendance
     *
     * @throws AttendanceException
     */
    public function checkIn(User $user, ?Carbon $customNow = null): Attendance
    {
        // 1. Validate active status
        if ($user->status !== 'active') {
            throw new AttendanceException('Akun Anda tidak aktif. Silakan hubungi administrator.', 403);
        }

        // 2. Validate user role
        if ($user->role === 'pimpinan') {
            throw new AttendanceException('Pimpinan tidak dapat melakukan absensi.', 403);
        }

        if ($user->role === 'admin') {
            throw new AttendanceException('Admin tidak dapat melakukan absensi melalui endpoint ini.', 403);
        }

        if (!in_array($user->role, ['dosen', 'tendik'])) {
            throw new AttendanceException('Role Anda tidak memiliki akses untuk melakukan absensi.', 403);
        }

        // 3. Determine server datetime
        $now = $customNow ?? Carbon::now();
        $todayDate = $now->toDateString();
        $dayName = $this->getDayName($now);

        // 4. Validate work day
        $workDay = WorkDay::where('day', $dayName)->first();
        if (!$workDay || !$workDay->is_active) {
            throw new AttendanceException('Hari ini (' . ucfirst($dayName) . ') bukan merupakan hari kerja.', 422);
        }

        // 5. Validate holiday
        $holiday = Holiday::where('date', $todayDate)->first();
        if ($holiday) {
            throw new AttendanceException('Hari ini adalah hari libur: ' . $holiday->name, 422);
        }

        // 6. Validate existing attendance record for today
        $existing = Attendance::where('user_id', $user->id)
            ->where('attendance_date', $todayDate)
            ->first();

        if ($existing) {
            throw new AttendanceException('Anda sudah melakukan absensi hari ini.', 422);
        }

        // 7. Store attendance with atomic transaction & database unique constraint safety net
        try {
            return DB::transaction(function () use ($user, $todayDate, $now) {
                return Attendance::create([
                    'user_id' => $user->id,
                    'attendance_date' => $todayDate,
                    'check_in' => $now,
                    'status' => 'hadir',
                    'notes' => null,
                ]);
            });
        } catch (QueryException $e) {
            // Check for SQL unique constraint violation (SQLSTATE 23000)
            if ($e->getCode() == 23000 || str_contains($e->getMessage(), 'Duplicate entry') || str_contains($e->getMessage(), 'attendances_user_id_attendance_date_unique')) {
                throw new AttendanceException('Anda sudah melakukan absensi hari ini.', 422);
            }

            throw $e;
        }
    }

    /**
     * Get paginated attendance history for the user.
     *
     * @param  User  $user
     * @param  int  $perPage
     * @param  array  $filters
     * @return LengthAwarePaginator
     */
    public function getHistory(User $user, int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Attendance::where('user_id', $user->id)
            ->orderBy('attendance_date', 'desc')
            ->orderBy('id', 'desc');

        if (!empty($filters['month'])) {
            $query->whereMonth('attendance_date', $filters['month']);
        }

        if (!empty($filters['year'])) {
            $query->whereYear('attendance_date', $filters['year']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage);
    }
}
