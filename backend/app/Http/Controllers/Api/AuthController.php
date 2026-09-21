<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Handle user login and issue Sanctum token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with('employee')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password yang Anda masukkan salah.',
                'errors' => [
                    'email' => ['Kredensial tidak cocok dengan data kami.'],
                ],
            ], 422);
        }

        if (!$user->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda berstatus nonaktif. Silakan hubungi administrator.',
                'errors' => [
                    'account' => ['Akun tidak aktif.'],
                ],
            ], 403);
        }

        // Create Sanctum personal access token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 200);
    }

    /**
     * Handle user logout and revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null,
        ], 200);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('employee');

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => new UserResource($user),
        ], 200);
    }
}
