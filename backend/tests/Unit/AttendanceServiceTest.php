<?php

namespace Tests\Unit;

use App\Exceptions\AttendanceException;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\User;
use App\Models\WorkDay;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AttendanceService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AttendanceService();

        // Seed basic work days
        $days = [
            ['day' => 'senin', 'is_active' => true],
            ['day' => 'selasa', 'is_active' => true],
            ['day' => 'rabu', 'is_active' => true],
            ['day' => 'kamis', 'is_active' => true],
            ['day' => 'jumat', 'is_active' => true],
            ['day' => 'sabtu', 'is_active' => false],
            ['day' => 'minggu', 'is_active' => false],
        ];

        foreach ($days as $dayData) {
            WorkDay::create($dayData);
        }
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_dosen_can_check_in_on_active_work_day()
    {
        // Set test now to a Wednesday (2026-09-23 is Wednesday)
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:15:00'));

        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        $attendance = $this->service->checkIn($user);

        $this->assertInstanceOf(Attendance::class, $attendance);
        $this->assertEquals($user->id, $attendance->user_id);
        $this->assertEquals('2026-09-23', $attendance->attendance_date->format('Y-m-d'));
        $this->assertEquals('hadir', $attendance->status);
        $this->assertEquals('2026-09-23 08:15:00', $attendance->check_in->format('Y-m-d H:i:s'));
    }

    public function test_tendik_can_check_in_on_active_work_day()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 07:50:00'));

        $user = User::factory()->create([
            'role' => 'tendik',
            'status' => 'active',
        ]);

        $attendance = $this->service->checkIn($user);

        $this->assertInstanceOf(Attendance::class, $attendance);
        $this->assertEquals('hadir', $attendance->status);
    }

    public function test_inactive_user_cannot_check_in()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'inactive',
        ]);

        $this->expectException(AttendanceException::class);
        $this->expectExceptionCode(403);
        $this->expectExceptionMessage('Akun Anda tidak aktif');

        $this->service->checkIn($user);
    }

    public function test_pimpinan_cannot_check_in()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $user = User::factory()->create([
            'role' => 'pimpinan',
            'status' => 'active',
        ]);

        $this->expectException(AttendanceException::class);
        $this->expectExceptionCode(403);
        $this->expectExceptionMessage('Pimpinan tidak dapat melakukan absensi');

        $this->service->checkIn($user);
    }

    public function test_admin_cannot_check_in_via_service()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $user = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->expectException(AttendanceException::class);
        $this->expectExceptionCode(403);
        $this->expectExceptionMessage('Admin tidak dapat melakukan absensi');

        $this->service->checkIn($user);
    }

    public function test_cannot_check_in_on_non_work_day()
    {
        // 2026-09-27 is Sunday (minggu)
        Carbon::setTestNow(Carbon::parse('2026-09-27 08:00:00'));

        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        $this->expectException(AttendanceException::class);
        $this->expectExceptionCode(422);
        $this->expectExceptionMessage('bukan merupakan hari kerja');

        $this->service->checkIn($user);
    }

    public function test_cannot_check_in_on_holiday()
    {
        // 2026-09-23 is Wednesday
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        Holiday::create([
            'date' => '2026-09-23',
            'name' => 'Hari Libur Nasional Uji Coba',
        ]);

        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        $this->expectException(AttendanceException::class);
        $this->expectExceptionCode(422);
        $this->expectExceptionMessage('Hari ini adalah hari libur: Hari Libur Nasional Uji Coba');

        $this->service->checkIn($user);
    }

    public function test_cannot_check_in_twice_on_same_day()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        // First check-in succeeds
        $this->service->checkIn($user);

        // Second check-in must throw AttendanceException
        $this->expectException(AttendanceException::class);
        $this->expectExceptionCode(422);
        $this->expectExceptionMessage('Anda sudah melakukan absensi hari ini');

        $this->service->checkIn($user);
    }

    public function test_get_today_attendance_returns_correct_details()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        $todayBefore = $this->service->getTodayAttendance($user);
        $this->assertFalse($todayBefore['has_checked_in']);
        $this->assertNull($todayBefore['attendance']);
        $this->assertEquals('2026-09-23', $todayBefore['server_date']);
        $this->assertTrue($todayBefore['is_work_day']);
        $this->assertFalse($todayBefore['is_holiday']);

        $attendance = $this->service->checkIn($user);

        $todayAfter = $this->service->getTodayAttendance($user);
        $this->assertTrue($todayAfter['has_checked_in']);
        $this->assertNotNull($todayAfter['attendance']);
        $this->assertEquals($attendance->id, $todayAfter['attendance']->id);
    }

    public function test_get_history_returns_paginated_attendances()
    {
        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        // Create 20 attendance records
        for ($i = 1; $i <= 20; $i++) {
            Attendance::create([
                'user_id' => $user->id,
                'attendance_date' => Carbon::parse('2026-08-01')->addDays($i)->toDateString(),
                'check_in' => Carbon::parse('2026-08-01 08:00:00')->addDays($i),
                'status' => 'hadir',
            ]);
        }

        $paginated = $this->service->getHistory($user, 10);

        $this->assertEquals(20, $paginated->total());
        $this->assertEquals(10, $paginated->perPage());
        $this->assertEquals(2, $paginated->lastPage());
        $this->assertCount(10, $paginated->items());
    }
}
