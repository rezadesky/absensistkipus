<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\WorkDay;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeaveRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

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
     * 1. User belum login tidak dapat akses API (401).
     */
    public function test_unauthenticated_user_cannot_access_leave_endpoints()
    {
        $this->getJson('/api/leave')->assertStatus(401);
        $this->postJson('/api/leave')->assertStatus(401);
        $this->getJson('/api/leave/1')->assertStatus(401);
        $this->getJson('/api/admin/leave')->assertStatus(401);
        $this->getJson('/api/leadership/leave')->assertStatus(401);
    }

    /**
     * 2. Dosen dapat membuat izin.
     */
    public function test_dosen_can_create_leave_request()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $response = $this->postJson('/api/leave', [
            'type' => 'sakit',
            'start_date' => '2026-09-23',
            'end_date' => '2026-09-24',
            'reason' => 'Demam dan flu berat.',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Pengajuan izin berhasil dibuat.',
                'data' => [
                    'user_id' => $dosen->id,
                    'type' => 'sakit',
                    'start_date' => '2026-09-23',
                    'end_date' => '2026-09-24',
                    'status' => 'menunggu',
                ],
            ]);

        $this->assertDatabaseHas('leave_requests', [
            'user_id' => $dosen->id,
            'type' => 'sakit',
            'status' => 'menunggu',
        ]);
    }

    /**
     * 3. Dosen dapat melihat izin miliknya.
     */
    public function test_dosen_can_view_own_leave_requests()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        $leave = LeaveRequest::factory()->create([
            'user_id' => $dosen->id,
            'reason' => 'Urusan keluarga mendesak.',
        ]);

        Sanctum::actingAs($dosen);

        $response = $this->getJson('/api/leave');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(1, 'data.items');

        $detailResponse = $this->getJson('/api/leave/' . $leave->id);
        $detailResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $leave->id,
                    'reason' => 'Urusan keluarga mendesak.',
                ],
            ]);
    }

    /**
     * 4. Dosen tidak dapat melihat izin user lain.
     */
    public function test_dosen_cannot_view_other_user_leave_request()
    {
        $dosen1 = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        $dosen2 = User::factory()->create(['role' => 'dosen', 'status' => 'active']);

        $leave2 = LeaveRequest::factory()->create(['user_id' => $dosen2->id]);

        Sanctum::actingAs($dosen1);

        $response = $this->getJson('/api/leave/' . $leave2->id);
        $response->assertStatus(404);
    }

    /**
     * 5 & 6. Dosen tidak dapat approve atau reject izin.
     */
    public function test_dosen_cannot_approve_or_reject_leave_request()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        $leave = LeaveRequest::factory()->create();

        Sanctum::actingAs($dosen);

        $this->postJson('/api/admin/leave/' . $leave->id . '/approve')
            ->assertStatus(403);

        $this->postJson('/api/admin/leave/' . $leave->id . '/reject', ['review_note' => 'Ditolak'])
            ->assertStatus(403);
    }

    /**
     * 7. Tendik dapat membuat izin.
     */
    public function test_tendik_can_create_leave_request()
    {
        $tendik = User::factory()->create(['role' => 'tendik', 'status' => 'active']);
        Sanctum::actingAs($tendik);

        $response = $this->postJson('/api/leave', [
            'type' => 'dinas',
            'start_date' => '2026-09-25',
            'end_date' => '2026-09-25',
            'reason' => 'Pelatihan Sistem Informasi.',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user_id' => $tendik->id,
                    'type' => 'dinas',
                    'status' => 'menunggu',
                ],
            ]);
    }

    /**
     * 8. Admin dapat melihat semua izin.
     */
    public function test_admin_can_view_all_leave_requests()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $user1 = User::factory()->create(['role' => 'dosen']);
        $user2 = User::factory()->create(['role' => 'tendik']);

        LeaveRequest::factory()->create(['user_id' => $user1->id]);
        LeaveRequest::factory()->create(['user_id' => $user2->id]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/leave');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.items');
    }

    /**
     * 9. Admin dapat approve izin.
     */
    public function test_admin_can_approve_leave_request()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);

        $leave = LeaveRequest::factory()->create([
            'user_id' => $dosen->id,
            'start_date' => '2026-09-23', // Wednesday
            'end_date' => '2026-09-24', // Thursday
            'status' => 'menunggu',
            'reason' => 'Workshop Penulisan Jurnal',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/leave/' . $leave->id . '/approve', [
            'review_note' => 'Disetujui. Harap kumpulkan sertifikat setelah kegiatan.',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $leave->id,
                    'status' => 'disetujui',
                    'reviewed_by' => $admin->id,
                    'review_note' => 'Disetujui. Harap kumpulkan sertifikat setelah kegiatan.',
                ],
            ]);

        // Verify attendance record synchronized for active work days
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
    }

    /**
     * 10. Admin dapat reject izin.
     */
    public function test_admin_can_reject_leave_request()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $tendik = User::factory()->create(['role' => 'tendik', 'status' => 'active']);

        $leave = LeaveRequest::factory()->create([
            'user_id' => $tendik->id,
            'status' => 'menunggu',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/leave/' . $leave->id . '/reject', [
            'review_note' => 'Mohon reschedule karena ada agenda akreditasi.',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $leave->id,
                    'status' => 'ditolak',
                    'reviewed_by' => $admin->id,
                    'review_note' => 'Mohon reschedule karena ada agenda akreditasi.',
                ],
            ]);
    }

    /**
     * 11. Admin tidak dapat approve izin yang sudah approved.
     */
    public function test_admin_cannot_approve_already_approved_leave()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $leave = LeaveRequest::factory()->create([
            'status' => 'disetujui',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/leave/' . $leave->id . '/approve');
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * 12. Admin tidak dapat reject izin yang sudah rejected.
     */
    public function test_admin_cannot_reject_already_rejected_leave()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $leave = LeaveRequest::factory()->create([
            'status' => 'ditolak',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'review_note' => 'Ditolak sebelumnya.',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/leave/' . $leave->id . '/reject', [
            'review_note' => 'Coba tolak lagi.',
        ]);
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * 13. Pimpinan dapat melihat izin.
     */
    public function test_pimpinan_can_view_leave_requests()
    {
        $pimpinan = User::factory()->create(['role' => 'pimpinan', 'status' => 'active']);
        $leave = LeaveRequest::factory()->create();

        Sanctum::actingAs($pimpinan);

        $this->getJson('/api/leadership/leave')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data.items');

        $this->getJson('/api/leadership/leave/' . $leave->id)
            ->assertStatus(200);
    }

    /**
     * 14 & 15. Pimpinan tidak dapat approve atau reject.
     */
    public function test_pimpinan_cannot_approve_or_reject()
    {
        $pimpinan = User::factory()->create(['role' => 'pimpinan', 'status' => 'active']);
        $leave = LeaveRequest::factory()->create();

        Sanctum::actingAs($pimpinan);

        $this->postJson('/api/admin/leave/' . $leave->id . '/approve')
            ->assertStatus(403);

        $this->postJson('/api/admin/leave/' . $leave->id . '/reject', ['review_note' => 'Tolak'])
            ->assertStatus(403);
    }

    /**
     * 16. Type invalid.
     */
    public function test_validation_fails_on_invalid_type()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $response = $this->postJson('/api/leave', [
            'type' => 'liburan_pribadi', // invalid
            'start_date' => '2026-09-23',
            'end_date' => '2026-09-24',
            'reason' => 'Liburan',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    /**
     * 17. Tanggal invalid.
     */
    public function test_validation_fails_on_invalid_date_format()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $response = $this->postJson('/api/leave', [
            'type' => 'sakit',
            'start_date' => '23-09-2026', // invalid format
            'end_date' => '2026/09/24', // invalid format
            'reason' => 'Sakit',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date', 'end_date']);
    }

    /**
     * 18. end_date sebelum start_date.
     */
    public function test_validation_fails_when_end_date_is_before_start_date()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $response = $this->postJson('/api/leave', [
            'type' => 'sakit',
            'start_date' => '2026-09-25',
            'end_date' => '2026-09-23',
            'reason' => 'Sakit',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    /**
     * 19. Reason kosong.
     */
    public function test_validation_fails_when_reason_is_empty()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $response = $this->postJson('/api/leave', [
            'type' => 'sakit',
            'start_date' => '2026-09-23',
            'end_date' => '2026-09-23',
            'reason' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);
    }

    /**
     * 20. File invalid (e.g. php/exe).
     */
    public function test_validation_fails_on_invalid_file_extension()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $file = UploadedFile::fake()->create('script.php', 100, 'application/x-php');

        $response = $this->postJson('/api/leave', [
            'type' => 'sakit',
            'start_date' => '2026-09-23',
            'end_date' => '2026-09-23',
            'reason' => 'Surat dokter',
            'attachment' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['attachment']);
    }

    /**
     * 21. File terlalu besar (> 5MB).
     */
    public function test_validation_fails_on_oversized_file()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $file = UploadedFile::fake()->create('large_doc.pdf', 6000, 'application/pdf');

        $response = $this->postJson('/api/leave', [
            'type' => 'sakit',
            'start_date' => '2026-09-23',
            'end_date' => '2026-09-23',
            'reason' => 'Surat dokter',
            'attachment' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['attachment']);
    }

    /**
     * 22. Overlapping leave.
     */
    public function test_cannot_create_overlapping_leave()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);

        LeaveRequest::create([
            'user_id' => $dosen->id,
            'type' => 'sakit',
            'start_date' => '2026-09-20',
            'end_date' => '2026-09-25',
            'reason' => 'Rawat inap',
            'status' => 'menunggu',
        ]);

        Sanctum::actingAs($dosen);

        // Overlapping range 22-26
        $response = $this->postJson('/api/leave', [
            'type' => 'izin',
            'start_date' => '2026-09-22',
            'end_date' => '2026-09-26',
            'reason' => 'Izin lain',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Anda sudah memiliki pengajuan izin yang sedang menunggu atau telah disetujui pada rentang tanggal tersebut.',
            ]);
    }

    /**
     * 23. user_id tidak boleh dimanipulasi dari request body.
     */
    public function test_user_id_cannot_be_manipulated_from_request_body()
    {
        $dosen1 = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        $dosen2 = User::factory()->create(['role' => 'dosen', 'status' => 'active']);

        Sanctum::actingAs($dosen1);

        $response = $this->postJson('/api/leave', [
            'user_id' => $dosen2->id, // Spoofing attempt
            'type' => 'sakit',
            'start_date' => '2026-09-23',
            'end_date' => '2026-09-23',
            'reason' => 'Demam',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('leave_requests', [
            'user_id' => $dosen1->id,
            'reason' => 'Demam',
        ]);

        $this->assertDatabaseMissing('leave_requests', [
            'user_id' => $dosen2->id,
        ]);
    }
}
