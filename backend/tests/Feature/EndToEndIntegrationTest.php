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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EndToEndIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('public');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /**
     * E2E: 1. Full Authentication Matrix Test.
     */
    public function test_e2e_authentication_matrix()
    {
        // Admin Login
        $resAdmin = $this->postJson('/api/login', [
            'email' => 'admin@stkip-us.ac.id',
            'password' => 'stkipus2026',
        ]);
        $resAdmin->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => ['role' => 'admin'],
                ],
            ]);

        // Dosen Login
        $resDosen = $this->postJson('/api/login', [
            'email' => 'dosen@stkip-us.ac.id',
            'password' => 'stkipus2026',
        ]);
        $resDosen->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => ['role' => 'dosen'],
                ],
            ]);

        // Tendik Login
        $resTendik = $this->postJson('/api/login', [
            'email' => 'tendik@stkip-us.ac.id',
            'password' => 'stkipus2026',
        ]);
        $resTendik->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => ['role' => 'tendik'],
                ],
            ]);

        // Pimpinan Login
        $resPimpinan = $this->postJson('/api/login', [
            'email' => 'pimpinan@stkip-us.ac.id',
            'password' => 'stkipus2026',
        ]);
        $resPimpinan->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => ['role' => 'pimpinan'],
                ],
            ]);

        // Invalid Password (returns 422 with credential validation message)
        $resInvalid = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrongpassword',
        ]);
        $resInvalid->assertStatus(422)
            ->assertJson(['success' => false]);

        // Inactive User
        $inactiveUser = User::factory()->create(['status' => 'inactive', 'password' => bcrypt('password123')]);
        $resInactive = $this->postJson('/api/login', [
            'email' => $inactiveUser->email,
            'password' => 'password123',
        ]);
        $resInactive->assertStatus(403);
    }

    /**
     * E2E: 2. Dosen Check-in Flow, Server Time & Duplicate Protection.
     */
    public function test_e2e_dosen_attendance_flow_and_duplicate_protection()
    {
        Carbon::setTestNow(Carbon::parse('2026-09-21 08:15:00')); // Monday (Work Day)

        $dosen = User::where('email', 'dosen@stkip-us.ac.id')->first();
        Sanctum::actingAs($dosen);

        // Step 1: Initial state - has not checked in
        $resToday1 = $this->getJson('/api/attendance/today');
        $resToday1->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'has_checked_in' => false,
                    'is_work_day' => true,
                    'is_holiday' => false,
                ],
            ]);

        // Step 2: Perform Check-in (201 Created)
        $resCheckIn = $this->postJson('/api/attendance/check-in');
        $resCheckIn->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Absensi berhasil dicatat.',
                'data' => [
                    'status' => 'hadir',
                    'attendance_date' => '2026-09-21',
                ],
            ]);

        // Step 3: Verify today state updated to Hadir
        $resToday2 = $this->getJson('/api/attendance/today');
        $resToday2->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'has_checked_in' => true,
                    'attendance' => [
                        'status' => 'hadir',
                        'attendance_date' => '2026-09-21',
                    ],
                ],
            ]);

        // Step 4: Duplicate Check-in Attempt (should be rejected)
        $resDuplicate = $this->postJson('/api/attendance/check-in');
        $resDuplicate->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Anda sudah melakukan absensi hari ini.',
            ]);

        // Step 5: Database constraint verification (ensure only 1 record)
        $count = Attendance::where('user_id', $dosen->id)
            ->where('attendance_date', '2026-09-21')
            ->count();
        $this->assertEquals(1, $count);
    }

    /**
     * E2E: 3. Leave Request Lifecycle (Dosen Apply -> Admin Approve -> Sync Attendance).
     */
    public function test_e2e_leave_lifecycle_approval_and_sync()
    {
        $dosen = User::where('email', 'dosen@stkip-us.ac.id')->first();
        $admin = User::where('email', 'admin@stkip-us.ac.id')->first();

        // 1. Dosen creates leave request with attachment
        Sanctum::actingAs($dosen);
        $pdfFile = UploadedFile::fake()->create('surat_tugas.pdf', 500, 'application/pdf');

        $resApply = $this->postJson('/api/leave', [
            'type' => 'dinas',
            'start_date' => '2026-09-23', // Wednesday
            'end_date' => '2026-09-24', // Thursday
            'reason' => 'Dinas Luar Akreditasi Prodi',
            'attachment' => $pdfFile,
        ]);

        $resApply->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'menunggu',
                    'type' => 'dinas',
                ],
            ]);

        $leaveId = $resApply->json('data.id');

        // 2. Admin logs in and approves leave
        Sanctum::actingAs($admin);
        $resApprove = $this->postJson("/api/admin/leave/{$leaveId}/approve", [
            'review_note' => 'Disetujui. Laksanakan tugas dengan baik.',
        ]);

        $resApprove->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $leaveId,
                    'status' => 'disetujui',
                    'reviewed_by' => $admin->id,
                ],
            ]);

        // 3. Verify attendance records synchronized for active work days
        $this->assertDatabaseHas('attendances', [
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-23',
            'status' => 'izin',
        ]);
        $this->assertDatabaseHas('attendances', [
            'user_id' => $dosen->id,
            'attendance_date' => '2026-09-24',
            'status' => 'izin',
        ]);

        // 4. Dosen checks status (synced in mobile)
        Sanctum::actingAs($dosen);
        $resDosenCheck = $this->getJson("/api/leave/{$leaveId}");
        $resDosenCheck->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'disetujui',
                    'review_note' => 'Disetujui. Laksanakan tugas dengan baik.',
                ],
            ]);
    }

    /**
     * E2E: 4. Leave Request Rejection Lifecycle.
     */
    public function test_e2e_leave_lifecycle_rejection()
    {
        $tendik = User::where('email', 'tendik@stkip-us.ac.id')->first();
        $admin = User::where('email', 'admin@stkip-us.ac.id')->first();

        // 1. Tendik applies for leave
        Sanctum::actingAs($tendik);
        $resApply = $this->postJson('/api/leave', [
            'type' => 'izin',
            'start_date' => '2026-09-28',
            'end_date' => '2026-09-28',
            'reason' => 'Keperluan mendesak.',
        ]);
        $leaveId = $resApply->json('data.id');

        // 2. Admin rejects leave
        Sanctum::actingAs($admin);
        $resReject = $this->postJson("/api/admin/leave/{$leaveId}/reject", [
            'review_note' => 'Mohon maaf tanggal tersebut ada agenda rapat institusi.',
        ]);

        $resReject->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $leaveId,
                    'status' => 'ditolak',
                    'review_note' => 'Mohon maaf tanggal tersebut ada agenda rapat institusi.',
                ],
            ]);

        // 3. Verify no attendance record generated
        $this->assertDatabaseMissing('attendances', [
            'user_id' => $tendik->id,
            'attendance_date' => '2026-09-28',
        ]);
    }

    /**
     * E2E: 5. IDOR & Strict Data Protection Test.
     */
    public function test_e2e_idor_and_data_isolation()
    {
        $dosen1 = User::where('email', 'dosen@stkip-us.ac.id')->first();
        $dosen2 = User::factory()->create(['role' => 'dosen', 'status' => 'active']);

        // Dosen 2 creates leave
        $leaveDosen2 = LeaveRequest::create([
            'user_id' => $dosen2->id,
            'type' => 'sakit',
            'start_date' => '2026-09-25',
            'end_date' => '2026-09-25',
            'reason' => 'Sakit pribadi.',
            'status' => 'menunggu',
        ]);

        // Dosen 1 attempts to access Dosen 2's leave -> 404
        Sanctum::actingAs($dosen1);
        $resIdor = $this->getJson("/api/leave/{$leaveDosen2->id}");
        $resIdor->assertStatus(404);
    }

    /**
     * E2E: 6. Admin CRUD Lifecycle.
     */
    public function test_e2e_admin_crud_lifecycle()
    {
        $admin = User::where('email', 'admin@stkip-us.ac.id')->first();
        Sanctum::actingAs($admin);

        // 1. Create Tendik
        $resCreate = $this->postJson('/api/admin/tendik', [
            'name' => 'Tendik Percobaan S.T.',
            'email' => 'tendik.percobaan@example.com',
            'password' => 'password123',
            'employee_number' => '199501012022011003',
            'department' => 'Tendik',
            'position' => 'Staf IT',
            'status' => 'active',
        ]);

        $resCreate->assertStatus(201);
        $newUserId = $resCreate->json('data.id');

        // 2. Deactivate Tendik
        $resDeactivate = $this->putJson("/api/admin/tendik/{$newUserId}", [
            'name' => 'Tendik Percobaan S.T.',
            'email' => 'tendik.percobaan@example.com',
            'status' => 'inactive',
        ]);
        $resDeactivate->assertStatus(200)
            ->assertJson([
                'data' => ['status' => 'inactive'],
            ]);

        // 3. Inactive Tendik cannot login
        $resLogin = $this->postJson('/api/login', [
            'email' => 'tendik.percobaan@example.com',
            'password' => 'password123',
        ]);
        $resLogin->assertStatus(403);
    }

    /**
     * E2E: 7. Leadership Read-Only Monitoring & Executive Reports.
     */
    public function test_e2e_leadership_executive_monitoring()
    {
        $pimpinan = User::where('email', 'pimpinan@stkip-us.ac.id')->first();
        Sanctum::actingAs($pimpinan);

        // 1. Executive Dashboard
        $this->getJson('/api/leadership/dashboard')
            ->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'stats' => ['total_dosen', 'total_tendik', 'hadir_hari_ini', 'izin_hari_ini', 'belum_absen'],
                    'attendance_today',
                ],
            ]);

        // 2. Attendance Monitoring
        $this->getJson('/api/leadership/attendance')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data' => ['items', 'pagination']]);

        // 3. Leave Monitoring
        $this->getJson('/api/leadership/leave')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data' => ['items', 'pagination']]);

        // 4. Executive Reports
        $this->getJson('/api/leadership/reports/attendance?start_date=2026-09-01&end_date=2026-09-30')
            ->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['period', 'total_pegawai', 'total_hadir', 'total_izin', 'attendance_percentage'],
            ]);

        $this->getJson('/api/leadership/reports/leave?start_date=2026-09-01&end_date=2026-09-30')
            ->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['total_pengajuan', 'status_counts', 'type_counts'],
            ]);

        // 5. Read-Only Violations are strictly prohibited
        $this->postJson('/api/attendance/check-in')->assertStatus(403);
        $this->postJson('/api/admin/dosen', ['name' => 'Hack'])->assertStatus(403);
    }
}
