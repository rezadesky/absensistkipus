<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test admin can access admin role-protected endpoint.
     */
    public function test_admin_can_access_admin_ping_endpoint()
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/ping');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Admin area access verified.',
            ]);
    }

    /**
     * Test dosen receives 403 Forbidden on admin endpoint.
     */
    public function test_dosen_cannot_access_admin_ping_endpoint()
    {
        $dosen = User::where('email', 'dosen1@example.com')->first();

        $response = $this->actingAs($dosen, 'sanctum')->getJson('/api/admin/ping');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.',
            ]);
    }

    /**
     * Test tendik receives 403 Forbidden on admin endpoint.
     */
    public function test_tendik_cannot_access_admin_ping_endpoint()
    {
        $tendik = User::where('email', 'tendik1@example.com')->first();

        $response = $this->actingAs($tendik, 'sanctum')->getJson('/api/admin/ping');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.',
            ]);
    }

    /**
     * Test pimpinan receives 403 Forbidden on admin endpoint.
     */
    public function test_pimpinan_cannot_access_admin_ping_endpoint()
    {
        $pimpinan = User::where('email', 'pimpinan@example.com')->first();

        $response = $this->actingAs($pimpinan, 'sanctum')->getJson('/api/admin/ping');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.',
            ]);
    }

    /**
     * Test unauthenticated access to admin endpoint returns 401.
     */
    public function test_unauthenticated_user_gets_401()
    {
        $response = $this->getJson('/api/admin/ping');

        $response->assertStatus(401);
    }
}
