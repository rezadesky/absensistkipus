<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_non_admin_cannot_access_admin_api()
    {
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Sanctum::actingAs($dosen);

        $this->getJson('/api/admin/dashboard')->assertStatus(403);
        $this->getJson('/api/admin/dosen')->assertStatus(403);
        $this->getJson('/api/admin/attendance/today')->assertStatus(403);
        $this->getJson('/api/admin/attendance/history')->assertStatus(403);
        $this->getJson('/api/admin/work-days')->assertStatus(403);
    }

    public function test_admin_can_access_dashboard_analytics()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $dosen1 = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        $tendik1 = User::factory()->create(['role' => 'tendik', 'status' => 'active']);

        Employee::create(['user_id' => $dosen1->id, 'department' => 'Dosen']);
        Employee::create(['user_id' => $tendik1->id, 'department' => 'Tendik']);

        Attendance::create([
            'user_id' => $dosen1->id,
            'attendance_date' => now()->toDateString(),
            'check_in' => now(),
            'status' => 'hadir',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_dosen' => 1,
                        'total_tendik' => 1,
                        'hadir_hari_ini' => 1,
                        'belum_absen' => 1,
                    ],
                ],
            ]);
    }

    public function test_admin_can_crud_dosen()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        Sanctum::actingAs($admin);

        // 1. Create Dosen
        $createRes = $this->postJson('/api/admin/dosen', [
            'name' => 'Dosen Baru S.Pd.',
            'email' => 'dosenbaru@example.com',
            'password' => 'password123',
            'employee_number' => '199001012020011001',
            'department' => 'Dosen',
            'position' => 'Asisten Ahli',
            'status' => 'active',
        ]);

        $createRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Dosen Baru S.Pd.',
                    'role' => 'dosen',
                ],
            ]);

        $dosenId = $createRes->json('data.id');

        // 2. List Dosen
        $listRes = $this->getJson('/api/admin/dosen');
        $listRes->assertStatus(200)
            ->assertJsonCount(1, 'data.items');

        // 3. Detail Dosen
        $detailRes = $this->getJson('/api/admin/dosen/' . $dosenId);
        $detailRes->assertStatus(200)
            ->assertJson([
                'data' => ['id' => $dosenId, 'name' => 'Dosen Baru S.Pd.'],
            ]);

        // 4. Update Dosen
        $updateRes = $this->putJson('/api/admin/dosen/' . $dosenId, [
            'name' => 'Dosen Baru M.Pd.',
            'email' => 'dosenbaru@example.com',
            'status' => 'inactive',
            'department' => 'Dosen',
            'position' => 'Lektor',
        ]);

        $updateRes->assertStatus(200)
            ->assertJson([
                'data' => ['name' => 'Dosen Baru M.Pd.', 'status' => 'inactive'],
            ]);

        // 5. Delete Dosen
        $deleteRes = $this->deleteJson('/api/admin/dosen/' . $dosenId);
        $deleteRes->assertStatus(200);

        $this->assertDatabaseMissing('users', ['id' => $dosenId]);
    }

    public function test_admin_cannot_delete_self()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        Sanctum::actingAs($admin);

        $response = $this->deleteJson('/api/admin/admins/' . $admin->id);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ]);

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_can_view_attendance_today_and_history()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $dosen = User::factory()->create(['role' => 'dosen', 'status' => 'active']);
        Employee::create(['user_id' => $dosen->id, 'department' => 'Dosen']);

        Attendance::create([
            'user_id' => $dosen->id,
            'attendance_date' => now()->toDateString(),
            'check_in' => now(),
            'status' => 'hadir',
        ]);

        Sanctum::actingAs($admin);

        $todayRes = $this->getJson('/api/admin/attendance/today');
        $todayRes->assertStatus(200)
            ->assertJsonCount(1, 'data.items');

        $historyRes = $this->getJson('/api/admin/attendance/history');
        $historyRes->assertStatus(200)
            ->assertJsonCount(1, 'data.items');

        $summaryRes = $this->getJson('/api/admin/attendance/summary');
        $summaryRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['total_hadir' => 1],
            ]);
    }
}
