<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Map target route path or requested entity to user role.
     */
    protected function getRoleFromRequest(Request $request): string
    {
        $path = $request->path();
        if (str_contains($path, 'admin/dosen')) {
            return 'dosen';
        }
        if (str_contains($path, 'admin/tendik')) {
            return 'tendik';
        }
        if (str_contains($path, 'admin/pimpinan')) {
            return 'pimpinan';
        }
        if (str_contains($path, 'admin/admins')) {
            return 'admin';
        }

        return $request->input('role', 'dosen');
    }

    /**
     * Get paginated list of users filtered by role, unit, status, and search.
     * GET /api/admin/{role}
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $role = $this->getRoleFromRequest($request);
        $perPage = (int) $request->input('per_page', 10);
        if ($perPage < 1) {
            $perPage = 10;
        }

        $query = User::with(['employee'])->where('role', $role)->orderBy('id', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('unit') && $request->input('unit') !== 'all') {
            $unit = $request->input('unit');
            $query->whereHas('employee', function ($q) use ($unit) {
                $q->where('department', $unit);
            });
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('employee_number', 'like', "%{$search}%")
                         ->orWhere('position', 'like', "%{$search}%")
                         ->orWhere('department', 'like', "%{$search}%");
                  });
            });
        }

        $paginated = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => "Daftar data {$role} berhasil diambil.",
            'data' => [
                'items' => UserResource::collection($paginated->items()),
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                    'has_more_pages' => $paginated->hasMorePages(),
                ],
            ],
        ], 200);
    }

    /**
     * Get detail of a specific user.
     * GET /api/admin/{role}/{id}
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $role = $this->getRoleFromRequest($request);
        $user = User::with(['employee'])->where('role', $role)->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "Data {$role} tidak ditemukan.",
                'errors' => (object) [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Detail data {$role} berhasil diambil.",
            'data' => new UserResource($user),
        ], 200);
    }

    /**
     * Create a new user with employee profile.
     * POST /api/admin/{role}
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $role = $this->getRoleFromRequest($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'status' => 'nullable|in:active,inactive',
            'employee_number' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $defaultPassword = $validated['password'] ?? 'password123';

        $user = DB::transaction(function () use ($validated, $role, $defaultPassword) {
            $createdUser = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($defaultPassword),
                'role' => $role,
                'status' => $validated['status'] ?? 'active',
            ]);

            // Create employee record
            Employee::create([
                'user_id' => $createdUser->id,
                'employee_number' => $validated['employee_number'] ?? null,
                'employee_type' => $role,
                'position' => $validated['position'] ?? null,
                'department' => $validated['department'] ?? ($role === 'dosen' ? 'Dosen' : ($role === 'tendik' ? 'Tendik' : 'Pimpinan')),
                'phone' => $validated['phone'] ?? null,
            ]);

            return $createdUser->fresh(['employee']);
        });

        return response()->json([
            'success' => true,
            'message' => "Data {$role} berhasil ditambahkan.",
            'data' => new UserResource($user),
        ], 201);
    }

    /**
     * Update user and employee profile.
     * PUT /api/admin/{role}/{id}
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $role = $this->getRoleFromRequest($request);
        $user = User::with(['employee'])->where('role', $role)->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "Data {$role} tidak ditemukan.",
                'errors' => (object) [],
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'status' => 'required|in:active,inactive',
            'employee_number' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($user, $validated, $role) {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'status' => $validated['status'],
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            // Update or create employee record
            Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_number' => $validated['employee_number'] ?? null,
                    'employee_type' => $role,
                    'position' => $validated['position'] ?? null,
                    'department' => $validated['department'] ?? ($role === 'dosen' ? 'Dosen' : ($role === 'tendik' ? 'Tendik' : 'Pimpinan')),
                    'phone' => $validated['phone'] ?? null,
                ]
            );
        });

        return response()->json([
            'success' => true,
            'message' => "Data {$role} berhasil diperbarui.",
            'data' => new UserResource($user->fresh(['employee'])),
        ], 200);
    }

    /**
     * Delete user and cascade relations.
     * DELETE /api/admin/{role}/{id}
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $role = $this->getRoleFromRequest($request);
        $user = User::where('role', $role)->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "Data {$role} tidak ditemukan.",
                'errors' => (object) [],
            ], 404);
        }

        // Prevent self deletion
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
                'errors' => (object) [],
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "Data {$role} berhasil dihapus.",
            'data' => null,
        ], 200);
    }
}
