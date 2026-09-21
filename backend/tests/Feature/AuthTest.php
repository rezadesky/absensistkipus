<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test successful login returns token and user data.
     */
    public function test_user_can_login_with_valid_credentials()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                        'status',
                    ],
                    'token',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    /**
     * Test login failure with wrong password.
     */
    public function test_user_cannot_login_with_invalid_password()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Email atau password yang Anda masukkan salah.',
            ]);
    }

    /**
     * Test login failure with non-existing email.
     */
    public function test_user_cannot_login_with_unregistered_email()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'unknown@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test inactive user cannot login.
     */
    public function test_inactive_user_cannot_login()
    {
        $inactiveUser = User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => Hash::make('password123'),
            'role' => 'dosen',
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Akun Anda berstatus nonaktif. Silakan hubungi administrator.',
            ]);
    }

    /**
     * Test unauthenticated access to /api/me returns 401.
     */
    public function test_unauthenticated_user_cannot_access_me_endpoint()
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can access /api/me.
     */
    public function test_authenticated_user_can_get_profile_from_me_endpoint()
    {
        $user = User::where('email', 'dosen1@example.com')->first();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'dosen1@example.com',
                    'role' => 'dosen',
                ],
            ]);
    }

    /**
     * Test user can logout and revoke token.
     */
    public function test_user_can_logout_and_revoke_token()
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $logoutResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout berhasil.',
            ]);

        // Reset in-memory auth guard to test token resolution from DB
        app('auth')->forgetGuards();

        // Verify token is no longer valid
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/me');

        $meResponse->assertStatus(401);
    }
}
