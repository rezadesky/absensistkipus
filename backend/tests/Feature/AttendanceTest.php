<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

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

    /**
     * 1. Test Dosen can check in.
     */
    public function test_dosen_can_check_in_successfully()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 07:45:00')); // Wednesday

        $dosen = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        Sanctum::actingAs($dosen);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Absensi berhasil dicatat.',
                'data' => [
                    'user_id' => $dosen->id,
                    'attendance_date' => '2026-09-23',
                    'status' => 'hadir',
                ],
            ]);

        $this->assertDatabaseHas('attendances', [
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-23',
            'status' => 'hadir',
        ]);
    }

    /**
     * 2. Test Tendik can check in.
     */
    public function test_tendik_can_check_in_successfully()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 07:55:00')); // Wednesday

        $tendik = User::factory()->create([
            'role' => 'tendik',
            'status' => 'active',
        ]);

        Sanctum::actingAs($tendik);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Absensi berhasil dicatat.',
                'data' => [
                    'user_id' => $tendik->id,
                    'attendance_date' => '2026-09-23',
                    'status' => 'hadir',
                ],
            ]);
    }

    /**
     * 3. Test Pimpinan cannot check in.
     */
    public function test_pimpinan_cannot_check_in()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $pimpinan = User::factory()->create([
            'role' => 'pimpinan',
            'status' => 'active',
        ]);

        Sanctum::actingAs($pimpinan);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Pimpinan tidak dapat melakukan absensi.',
            ]);
    }

    /**
     * 4. Test Admin cannot check in via this endpoint.
     */
    public function test_admin_cannot_check_in()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Admin tidak dapat melakukan absensi melalui endpoint ini.',
            ]);
    }

    /**
     * 5. Test inactive user cannot check in.
     */
    public function test_inactive_user_cannot_check_in()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'inactive',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.',
            ]);
    }

    /**
     * 6. Test unauthenticated user gets 401 on attendance endpoints.
     */
    public function test_unauthenticated_user_gets_401()
    {
        $this->getJson('/api/attendance/today')->assertStatus(401);
        $this->postJson('/api/attendance/check-in')->assertStatus(401);
        $this->getJson('/api/attendance/history')->assertStatus(401);
    }

    /**
     * 7. Test user who already checked in gets appropriate error.
     */
    public function test_user_already_checked_in_gets_error()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $dosen = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        Sanctum::actingAs($dosen);

        // First check-in
        $this->postJson('/api/attendance/check-in')->assertStatus(201);

        // Second check-in
        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Anda sudah melakukan absensi hari ini.',
            ]);
    }

    /**
     * 8. Test duplicate database constraint layer prevents duplicate insertion.
     */
    public function test_duplicate_database_constraint_prevents_duplicate_record()
    {
        $user = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        Attendance::create([
            'user_id' => $user->id,
            'attendance_date' => '2026-09-23',
            'check_in' => '2026-09-23 08:00:00',
            'status' => 'hadir',
        ]);

        $this->expectException(QueryException::class);

        // Direct DB insertion must violate unique(user_id, attendance_date)
        Attendance::create([
            'user_id' => $user->id,
            'attendance_date' => '2026-09-23',
            'check_in' => '2026-09-23 09:00:00',
            'status' => 'hadir',
        ]);
    }

    /**
     * 9. Test cannot check in on holiday.
     */
    public function test_cannot_check_in_on_holiday()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        Holiday::create([
            'date' => '2026-09-23',
            'name' => 'Maulid Nabi Muhammad SAW',
        ]);

        $dosen = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        Sanctum::actingAs($dosen);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Hari ini adalah hari libur: Maulid Nabi Muhammad SAW',
            ]);
    }

    /**
     * 10. Test cannot check in on non-work day (e.g. Sunday).
     */
    public function test_cannot_check_in_on_non_work_day()
    {
        // 2026-09-27 is Sunday
        Carbon::setTestNow(Carbon::parse('2026-09-27 08:00:00'));

        $tendik = User::factory()->create([
            'role' => 'tendik',
            'status' => 'active',
        ]);

        Sanctum::actingAs($tendik);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Hari ini (Minggu) bukan merupakan hari kerja.',
            ]);
    }

    /**
     * 11. Test check_in uses server time and ignores client time/date params.
     */
    public function test_check_in_uses_server_time_ignoring_client_params()
    {
        $serverTime = Carbon::parse('2026-09-23 08:30:15');
        Carbon::setTestNow($serverTime);

        $dosen = User::factory()->create([
            'role' => 'dosen',
            'status' => 'active',
        ]);

        Sanctum::actingAs($dosen);

        // Attempting to inject spoofed client date/time
        $response = $this->postJson('/api/attendance/check-in', [
            'attendance_date' => '2020-01-01',
            'check_in' => '2020-01-01 06:00:00',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('attendances', [
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-23',
            'status' => 'hadir',
        ]);

        $this->assertDatabaseMissing('attendances', [
            'attendance_date' => '2020-01-01',
        ]);
    }

    /**
     * 12. Test History returns user attendance history.
     */
    public function test_history_returns_user_attendance_records()
    {
        $user1 = User::factory()->create(['role' => 'dosen']);
        $user2 = User::factory()->create(['role' => 'dosen']);

        // Create records for user 1
        Attendance::create([
            'user_id' => $user1->id,
            'attendance_date' => '2026-09-21',
            'check_in' => '2026-09-21 07:45:00',
            'status' => 'hadir',
        ]);
        Attendance::create([
            'user_id' => $user1->id,
            'attendance_date' => '2026-09-22',
            'check_in' => '2026-09-22 07:50:00',
            'status' => 'hadir',
        ]);

        // Record for user 2 (should not appear in user 1's history)
        Attendance::create([
            'user_id' => $user2->id,
            'attendance_date' => '2026-09-22',
            'check_in' => '2026-09-22 07:55:00',
            'status' => 'hadir',
        ]);

        Sanctum::actingAs($user1);

        $response = $this->getJson('/api/attendance/history');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Riwayat absensi berhasil diambil.',
            ])
            ->assertJsonCount(2, 'data.items')
            ->assertJsonPath('data.pagination.total', 2);
    }

    /**
     * 13. Test Today returns correct data when absent vs when checked in.
     */
    public function test_today_returns_correct_data()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-23 08:00:00'));

        $user = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($user);

        // Before check-in
        $responseBefore = $this->getJson('/api/attendance/today');
        $responseBefore->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'has_checked_in' => false,
                    'attendance' => null,
                    'server_date' => '2026-09-23',
                    'is_work_day' => true,
                    'is_holiday' => false,
                ],
            ]);

        // Perform check-in
        $this->postJson('/api/attendance/check-in')->assertStatus(201);

        // After check-in
        $responseAfter = $this->getJson('/api/attendance/today');
        $responseAfter->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'has_checked_in' => true,
                    'server_date' => '2026-09-23',
                    'attendance' => [
                        'user_id' => $user->id,
                        'attendance_date' => '2026-09-23',
                        'status' => 'hadir',
                    ],
                ],
            ]);
    }

    /**
     * 14. Test pagination on history works properly.
     */
    public function test_history_pagination_works()
    {
        $user = User::factory()->create(['role' => 'tendik', 'status' => 'active']);

        // Create 25 records
        for ($i = 1; $i <= 25; $i++) {
            Attendance::create([
                'user_id' => $user->id,
                'attendance_date' => Carbon::parse('2026-08-01')->addDays($i)->toDateString(),
                'check_in' => Carbon::parse('2026-08-01 08:00:00')->addDays($i),
                'status' => 'hadir',
            ]);
        }

        Sanctum::actingAs($user);

        // Request page 1 with per_page 10
        $page1Response = $this->getJson('/api/attendance/history?per_page=10&page=1');
        $page1Response->assertStatus(200)
            ->assertJsonCount(10, 'data.items')
            ->assertJson([
                'data' => [
                    'pagination' => [
                        'current_page' => 1,
                        'per_page' => 10,
                        'total' => 25,
                        'last_page' => 3,
                        'has_more_pages' => true,
                    ],
                ],
            ]);

        // Request page 3 (last page with 5 items)
        $page3Response = $this->getJson('/api/attendance/history?per_page=10&page=3');
        $page3Response->assertStatus(200)
            ->assertJsonCount(5, 'data.items')
            ->assertJson([
                'data' => [
                    'pagination' => [
                        'current_page' => 3,
                        'per_page' => 10,
                        'total' => 25,
                        'last_page' => 3,
                        'has_more_pages' => false,
                    ],
                ],
            ]);
    }
}
