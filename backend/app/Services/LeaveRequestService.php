<?php

namespace App\Services;

use App\Exceptions\LeaveRequestException;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LeaveRequestService
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
     * Get paginated leave requests for a specific user (Dosen / Tendik).
     *
     * @param  User  $user
     * @param  int  $perPage
     * @param  array  $filters
     * @return LengthAwarePaginator
     */
    public function getUserLeaveRequests(User $user, int $perPage = 10, array $filters = []): LengthAwarePaginator
    {
        $query = LeaveRequest::with(['reviewer'])
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get detail of a leave request owned by the user.
     *
     * @param  User  $user
     * @param  int  $id
     * @return LeaveRequest
     *
     * @throws LeaveRequestException
     */
    public function getUserLeaveRequestDetail(User $user, int $id): LeaveRequest
    {
        $leaveRequest = LeaveRequest::with(['user.employee', 'reviewer'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$leaveRequest) {
            throw new LeaveRequestException('Pengajuan izin tidak ditemukan atau Anda tidak memiliki akses.', 404);
        }

        return $leaveRequest;
    }

    /**
     * Create a new leave request for authenticated Dosen / Tendik.
     *
     * @param  User  $user
     * @param  array  $validatedData
     * @param  UploadedFile|null  $file
     * @return LeaveRequest
     *
     * @throws LeaveRequestException
     */
    public function create(User $user, array $validatedData, ?UploadedFile $file = null): LeaveRequest
    {
        // 1. Verify user role & active status
        if (!$user->isActive()) {
            throw new LeaveRequestException('Akun Anda tidak aktif. Silakan hubungi administrator.', 403);
        }

        if (!in_array($user->role, ['dosen', 'tendik'])) {
            throw new LeaveRequestException('Role Anda tidak memiliki akses untuk mengajukan izin.', 403);
        }

        $startDate = $validatedData['start_date'];
        $endDate = $validatedData['end_date'];

        // 2. Overlapping check for active/pending leave requests
        $hasOverlap = LeaveRequest::where('user_id', $user->id)
            ->whereIn('status', ['menunggu', 'disetujui'])
            ->where('start_date', '<=', $endDate)
            ->where('end_date', '>=', $startDate)
            ->exists();

        if ($hasOverlap) {
            throw new LeaveRequestException('Anda sudah memiliki pengajuan izin yang sedang menunggu atau telah disetujui pada rentang tanggal tersebut.', 422);
        }

        // 3. Handle file upload if present
        $attachmentPath = null;
        if ($file && $file->isValid()) {
            $safeName = 'leave_' . $user->id . '_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $attachmentPath = $file->storeAs('leave-attachments', $safeName, 'public');
        }

        // 4. Create leave request
        return LeaveRequest::create([
            'user_id' => $user->id,
            'type' => $validatedData['type'],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $validatedData['reason'],
            'attachment' => $attachmentPath,
            'status' => 'menunggu',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_note' => null,
        ]);
    }

    /**
     * Get paginated list of all leave requests (for Admin & Leadership).
     *
     * @param  int  $perPage
     * @param  array  $filters
     * @return LengthAwarePaginator
     */
    public function getAllLeaveRequests(int $perPage = 10, array $filters = []): LengthAwarePaginator
    {
        $query = LeaveRequest::with(['user.employee', 'reviewer'])
            ->orderBy('id', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('start_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('end_date', '<=', $filters['end_date']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get detail of any leave request (for Admin & Leadership).
     *
     * @param  int  $id
     * @return LeaveRequest
     *
     * @throws LeaveRequestException
     */
    public function getLeaveRequestDetail(int $id): LeaveRequest
    {
        $leaveRequest = LeaveRequest::with(['user.employee', 'reviewer'])->find($id);

        if (!$leaveRequest) {
            throw new LeaveRequestException('Data pengajuan izin tidak ditemukan.', 404);
        }

        return $leaveRequest;
    }

    /**
     * Approve a pending leave request (Admin only).
     *
     * @param  User  $admin
     * @param  int  $id
     * @param  string|null  $reviewNote
     * @return LeaveRequest
     *
     * @throws LeaveRequestException
     */
    public function approve(User $admin, int $id, ?string $reviewNote = null): LeaveRequest
    {
        if ($admin->role !== 'admin' || !$admin->isActive()) {
            throw new LeaveRequestException('Akses ditolak. Hanya admin aktif yang dapat menyetujui pengajuan izin.', 403);
        }

        $leaveRequest = LeaveRequest::find($id);
        if (!$leaveRequest) {
            throw new LeaveRequestException('Data pengajuan izin tidak ditemukan.', 404);
        }

        if ($leaveRequest->status !== 'menunggu') {
            throw new LeaveRequestException('Pengajuan izin ini sudah diproses sebelumnya dan tidak dapat disetujui lagi.', 422);
        }

        return DB::transaction(function () use ($admin, $leaveRequest, $reviewNote) {
            $now = Carbon::now();

            $leaveRequest->update([
                'status' => 'disetujui',
                'reviewed_by' => $admin->id,
                'reviewed_at' => $now,
                'review_note' => $reviewNote,
            ]);

            // Synchronize with attendance system
            $this->syncAttendanceOnApproval($leaveRequest);

            return $leaveRequest->fresh(['user.employee', 'reviewer']);
        });
    }

    /**
     * Reject a pending leave request (Admin only).
     *
     * @param  User  $admin
     * @param  int  $id
     * @param  string  $reviewNote
     * @return LeaveRequest
     *
     * @throws LeaveRequestException
     */
    public function reject(User $admin, int $id, string $reviewNote): LeaveRequest
    {
        if ($admin->role !== 'admin' || !$admin->isActive()) {
            throw new LeaveRequestException('Akses ditolak. Hanya admin aktif yang dapat menolak pengajuan izin.', 403);
        }

        $leaveRequest = LeaveRequest::find($id);
        if (!$leaveRequest) {
            throw new LeaveRequestException('Data pengajuan izin tidak ditemukan.', 404);
        }

        if ($leaveRequest->status !== 'menunggu') {
            throw new LeaveRequestException('Pengajuan izin ini sudah diproses sebelumnya dan tidak dapat diubah lagi.', 422);
        }

        $leaveRequest->update([
            'status' => 'ditolak',
            'reviewed_by' => $admin->id,
            'reviewed_at' => Carbon::now(),
            'review_note' => $reviewNote,
        ]);

        return $leaveRequest->fresh(['user.employee', 'reviewer']);
    }

    /**
     * Synchronize approved leave request with attendance records for active work days.
     *
     * @param  LeaveRequest  $leaveRequest
     * @return void
     */
    protected function syncAttendanceOnApproval(LeaveRequest $leaveRequest): void
    {
        $period = CarbonPeriod::create($leaveRequest->start_date, $leaveRequest->end_date);
        $activeWorkDays = WorkDay::where('is_active', true)->pluck('day')->toArray();

        foreach ($period as $date) {
            $dayName = $this->dayNames[$date->dayOfWeekIso] ?? 'senin';

            // Only generate attendance for configured active work days
            if (in_array($dayName, $activeWorkDays)) {
                $dateString = $date->toDateString();

                Attendance::updateOrCreate(
                    [
                        'user_id' => $leaveRequest->user_id,
                        'attendance_date' => $dateString,
                    ],
                    [
                        'status' => 'izin',
                        'notes' => 'Izin (' . ucfirst($leaveRequest->type) . '): ' . $leaveRequest->reason,
                    ]
                );
            }
        }
    }
}
