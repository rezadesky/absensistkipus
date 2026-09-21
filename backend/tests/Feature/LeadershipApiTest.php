<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeadershipApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /**
     * Test unauthenticated access returns 401.
     */
    public function test_unauthenticated_cannot_access_leadership_api()
    {
        $this->getJson('/api/leadership/dashboard')->assertStatus(401);
        $this->getJson('/api/leadership/attendance')->assertStatus(401);
        $this->getJson('/api/leadership/leave')->assertStatus(401);
        $this->getJson('/api/leadership/reports/attendance')->assertStatus(401);
        $this->getJson('/api/leadership/reports/leave')->assertStatus(401);
    }

    /**
     * Test dosen receives 403 Forbidden.
     */
    public function test_dosen_cannot_access_leadership_api()
    {
        $dosen = User::where('email', 'dosen1@example.com')->first();
        Sanctum::actingAs($dosen);

        $this->getJson('/api/leadership/dashboard')->assertStatus(403);
        $this->getJson('/api/leadership/attendance')->assertStatus(403);
        $this->getJson('/api/leadership/leave')->assertStatus(403);
    }

    /**
     * Test tendik receives 403 Forbidden.
     */
    public function test_tendik_cannot_access_leadership_api()
    {
        $tendik = User::where('email', 'tendik1@example.com')->first();
        Sanctum::actingAs($tendik);

        $this->getJson('/api/leadership/dashboard')->assertStatus(403);
        $this->getJson('/api/leadership/attendance')->assertStatus(403);
        $this->getJson('/api/leadership/leave')->assertStatus(403);
    }

    /**
     * Test admin receives 403 Forbidden on leadership API.
     */
    public function test_admin_cannot_access_leadership_api()
    {
        $admin = User::where('email', 'admin@example.com')->first();
        Sanctum::actingAs($admin);

        $this->getJson('/api/leadership/dashboard')->assertStatus(403);
        $this->getJson('/api/leadership/attendance')->assertStatus(403);
        $this->getJson('/api/leadership/leave')->assertStatus(403);
    }

    /**
     * Test pimpinan can access dashboard and metrics are accurate.
     */
    public function test_pimpinan_can_view_dashboard_with_accurate_metrics()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-21 09:00:00')); // Monday (active work day)

        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        $dosen1 = User::where('email', 'dosen1@example.com')->first();
        $dosen2 = User::where('email', 'dosen2@example.com')->first();
        $tendik1 = User::where('email', 'tendik1@example.com')->first();

        // 1 Dosen Hadir
        Attendance::create([
            'user_id' => $dosen1->id,
            'attendance_date' => '2026-09-21',
            'check_in' => '2026-09-21 08:00:00',
            'status' => 'hadir',
        ]);

        // 1 Dosen Izin
        Attendance::create([
            'user_id' => $dosen2->id,
            'attendance_date' => '2026-09-21',
            'status' => 'izin',
            'notes' => 'Izin Sakit',
        ]);

        Sanctum::actingAs($pimpinan);

        $response = $this->getJson('/api/leadership/dashboard?date=2026-09-21');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_dosen' => 2,
                        'total_tendik' => 2,
                        'hadir_hari_ini' => 1,
                        'izin_hari_ini' => 1,
                        'belum_absen' => 2, // 2 Tendik have not checked in
                    ],
                    'date' => '2026-09-21',
                    'is_work_day' => true,
                    'is_holiday' => false,
                ],
            ]);
    }

    /**
     * Test dashboard calculates zero belum_absen on holiday.
     */
    public function test_dashboard_handles_holiday_correctly()
    {
        Holiday::create([
            'date' => '2026-09-21',
            'name' => 'Hari Libur Nasional',
        ]);

        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        Sanctum::actingAs($pimpinan);

        $response = $this->getJson('/api/leadership/dashboard?date=2026-09-21');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'stats' => [
                        'belum_absen' => 0,
                    ],
                    'is_holiday' => true,
                    'holiday_name' => 'Hari Libur Nasional',
                ],
            ]);
    }

    /**
     * Test pimpinan can view paginated attendance monitoring and apply filters.
     */
    public function test_pimpinan_can_view_attendance_monitoring_with_filters()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        $dosen = User::where('email', 'dosen1@example.com')->first();
        $tendik = User::where('email', 'tendik1@example.com')->first();

        Attendance::create([
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-21',
            'check_in' => '2026-09-21 07:30:00',
            'status' => 'hadir',
        ]);

        Attendance::create([
            'user_id' => $tendik->id,
            'attendance_date' => '2026-09-21',
            'check_in' => '2026-09-21 07:45:00',
            'status' => 'hadir',
        ]);

        Sanctum::actingAs($pimpinan);

        // 1. All attendances
        $resAll = $this->getJson('/api/leadership/attendance');
        $resAll->assertStatus(200)
            ->assertJsonCount(2, 'data.items');

        // 2. Filter by role = dosen
        $resDosen = $this->getJson('/api/leadership/attendance?role=dosen');
        $resDosen->assertStatus(200)
            ->assertJsonCount(1, 'data.items');

        // 3. Filter by role = tendik
        $resTendik = $this->getJson('/api/leadership/attendance?role=tendik');
        $resTendik->assertStatus(200)
            ->assertJsonCount(1, 'data.items');
    }

    /**
     * Test pimpinan attendance summary and percentage calculation.
     */
    public function test_pimpinan_attendance_summary()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        $dosen = User::where('email', 'dosen1@example.com')->first();

        Attendance::create([
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-01',
            'status' => 'hadir',
        ]);

        Attendance::create([
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-02',
            'status' => 'izin',
        ]);

        Sanctum::actingAs($pimpinan);

        $response = $this->getJson('/api/leadership/attendance/summary?month=9&year=2026');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'month' => 9,
                    'year' => 2026,
                    'total_hadir' => 1,
                    'total_izin' => 1,
                ],
            ]);
    }

    /**
     * Test pimpinan can view leave requests list and details.
     */
    public function test_pimpinan_can_view_leave_requests_and_detail()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        $dosen = User::where('email', 'dosen1@example.com')->first();

        $leave = LeaveRequest::create([
            'user_id' => $dosen->id,
            'type' => 'izin',
            'start_date' => '2026-09-25',
            'end_date' => '2026-09-26',
            'reason' => 'Urusan Keluarga',
            'status' => 'menunggu',
        ]);

        Sanctum::actingAs($pimpinan);

        // List
        $listRes = $this->getJson('/api/leadership/leave');
        $listRes->assertStatus(200)
            ->assertJsonCount(1, 'data.items');

        // Detail
        $detailRes = $this->getJson('/api/leadership/leave/' . $leave->id);
        $detailRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $leave->id,
                    'reason' => 'Urusan Keluarga',
                ],
            ]);
    }

    /**
     * Test pimpinan can view executive reports (attendance & leave).
     */
    public function test_pimpinan_can_view_executive_reports()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        $dosen = User::where('email', 'dosen1@example.com')->first();

        Attendance::create([
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-10',
            'status' => 'hadir',
        ]);

        LeaveRequest::create([
            'user_id' => $dosen->id,
            'type' => 'sakit',
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-16',
            'reason' => 'Demam tinggi',
            'status' => 'disetujui',
        ]);

        Sanctum::actingAs($pimpinan);

        // Attendance Report
        $attReport = $this->getJson('/api/leadership/reports/attendance?start_date=2026-09-01&end_date=2026-09-30');
        $attReport->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_hadir' => 1,
                ],
            ]);

        // Leave Report
        $leaveReport = $this->getJson('/api/leadership/reports/leave?start_date=2026-09-01&end_date=2026-09-30');
        $leaveReport->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_pengajuan' => 1,
                    'status_counts' => [
                        'disetujui' => 1,
                    ],
                    'type_counts' => [
                        'sakit' => 1,
                    ],
                ],
            ]);
    }

    /**
     * Test invalid date range validation on reports returns 422.
     */
    public function test_report_fails_when_end_date_before_start_date()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        Sanctum::actingAs($pimpinan);

        $response = $this->getJson('/api/leadership/reports/attendance?start_date=2026-09-20&end_date=2026-09-10');

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.',
            ]);
    }

    /**
     * Security: Pimpinan cannot approve or reject leave requests.
     */
    public function test_pimpinan_cannot_approve_or_reject_leave()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        $dosen = User::where('email', 'dosen1@example.com')->first();

        $leave = LeaveRequest::create([
            'user_id' => $dosen->id,
            'type' => 'izin',
            'start_date' => '2026-09-25',
            'end_date' => '2026-09-26',
            'reason' => 'Izin keperluan keluarga',
            'status' => 'menunggu',
        ]);

        Sanctum::actingAs($pimpinan);

        $this->postJson("/api/admin/leave/{$leave->id}/approve")->assertStatus(403);
        $this->postJson("/api/admin/leave/{$leave->id}/reject", ['review_note' => 'Ditolak'])->assertStatus(403);
    }

    /**
     * Security: Pimpinan cannot check in.
     */
    public function test_pimpinan_cannot_check_in()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        Sanctum::actingAs($pimpinan);

        $response = $this->postJson('/api/attendance/check-in');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Pimpinan tidak dapat melakukan absensi.',
            ]);
    }

    /**
     * Security: Pimpinan cannot mutate users or admin data.
     */
    public function test_pimpinan_cannot_mutate_users()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();
        Sanctum::actingAs($pimpinan);

        $this->postJson('/api/admin/dosen', [
            'name' => 'Fake Dosen',
            'email' => 'fakedosen@example.com',
            'password' => 'password123',
        ])->assertStatus(403);

        $this->deleteJson('/api/admin/dosen/1')->assertStatus(403);
    }
}
