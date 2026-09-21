<?php

use App\Http\Controllers\Api\Admin\AdminAttendanceController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminLeaveRequestController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Leadership\LeadershipLeaveRequestController;
use App\Http\Controllers\Api\LeaveRequestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - STKIP Usman Safri Absensi Fungsional
|--------------------------------------------------------------------------
*/

// Public Authentication Routes
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // -------------------------------------------------------------
    // Self Attendance Endpoints (Dosen & Tendik)
    // -------------------------------------------------------------
    Route::prefix('attendance')->group(function () {
        Route::get('/today', [AttendanceController::class, 'today']);
        Route::post('/check-in', [AttendanceController::class, 'checkIn']);
        Route::get('/history', [AttendanceController::class, 'history']);
        Route::get('/status', function () {
            return response()->json([
                'success' => true,
                'message' => 'Attendance foundation ready.',
                'data' => null,
            ]);
        });
    });

    // -------------------------------------------------------------
    // Self Leave / Izin Endpoints (Dosen & Tendik)
    // -------------------------------------------------------------
    Route::middleware(['role:dosen,tendik'])->prefix('leave')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'index']);
        Route::post('/', [LeaveRequestController::class, 'store']);
        Route::get('/{id}', [LeaveRequestController::class, 'show']);
    });

    // -------------------------------------------------------------
    // Complete Admin Web Management API (Admin Role Only)
    // -------------------------------------------------------------
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/ping', function () {
            return response()->json([
                'success' => true,
                'message' => 'Admin area access verified.',
                'data' => null,
            ]);
        });

        // 1. Admin Dashboard Analytics
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // 2. Master Data Dosen
        Route::get('/dosen', [AdminUserController::class, 'index']);
        Route::post('/dosen', [AdminUserController::class, 'store']);
        Route::get('/dosen/{id}', [AdminUserController::class, 'show']);
        Route::put('/dosen/{id}', [AdminUserController::class, 'update']);
        Route::delete('/dosen/{id}', [AdminUserController::class, 'destroy']);

        // 3. Master Data Tendik
        Route::get('/tendik', [AdminUserController::class, 'index']);
        Route::post('/tendik', [AdminUserController::class, 'store']);
        Route::get('/tendik/{id}', [AdminUserController::class, 'show']);
        Route::put('/tendik/{id}', [AdminUserController::class, 'update']);
        Route::delete('/tendik/{id}', [AdminUserController::class, 'destroy']);

        // 4. Master Data Pimpinan
        Route::get('/pimpinan', [AdminUserController::class, 'index']);
        Route::post('/pimpinan', [AdminUserController::class, 'store']);
        Route::get('/pimpinan/{id}', [AdminUserController::class, 'show']);
        Route::put('/pimpinan/{id}', [AdminUserController::class, 'update']);
        Route::delete('/pimpinan/{id}', [AdminUserController::class, 'destroy']);

        // 5. Master Data Admin
        Route::get('/admins', [AdminUserController::class, 'index']);
        Route::post('/admins', [AdminUserController::class, 'store']);
        Route::get('/admins/{id}', [AdminUserController::class, 'show']);
        Route::put('/admins/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admins/{id}', [AdminUserController::class, 'destroy']);

        // 6. Admin Attendance Monitoring & Reports
        Route::get('/attendance/today', [AdminAttendanceController::class, 'today']);
        Route::get('/attendance/history', [AdminAttendanceController::class, 'history']);
        Route::get('/attendance/summary', [AdminAttendanceController::class, 'summary']);

        // 7. Admin Leave Request Management
        Route::get('/leave', [AdminLeaveRequestController::class, 'index']);
        Route::get('/leave/{id}', [AdminLeaveRequestController::class, 'show']);
        Route::post('/leave/{id}/approve', [AdminLeaveRequestController::class, 'approve']);
        Route::post('/leave/{id}/reject', [AdminLeaveRequestController::class, 'reject']);

        // 8. Admin Settings (Work Days & Holidays)
        Route::get('/work-days', [AdminSettingsController::class, 'getWorkDays']);
        Route::put('/work-days', [AdminSettingsController::class, 'updateWorkDays']);
        Route::get('/holidays', [AdminSettingsController::class, 'getHolidays']);
        Route::post('/holidays', [AdminSettingsController::class, 'storeHoliday']);
        Route::delete('/holidays/{id}', [AdminSettingsController::class, 'destroyHoliday']);
    });

    // -------------------------------------------------------------
    // Leadership Endpoints (Pimpinan - Read-Only)
    // -------------------------------------------------------------
    Route::middleware(['role:pimpinan'])->prefix('leadership')->group(function () {
        // 1. Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\Leadership\LeadershipDashboardController::class, 'index']);

        // 2. Attendance Monitoring
        Route::get('/attendance', [\App\Http\Controllers\Api\Leadership\LeadershipAttendanceController::class, 'index']);
        Route::get('/attendance/today', [\App\Http\Controllers\Api\Leadership\LeadershipAttendanceController::class, 'today']);
        Route::get('/attendance/history', [\App\Http\Controllers\Api\Leadership\LeadershipAttendanceController::class, 'history']);
        Route::get('/attendance/summary', [\App\Http\Controllers\Api\Leadership\LeadershipAttendanceController::class, 'summary']);

        // 3. Leave Requests Monitoring (Read-Only)
        Route::get('/leave', [\App\Http\Controllers\Api\Leadership\LeadershipLeaveRequestController::class, 'index']);
        Route::get('/leave/{id}', [\App\Http\Controllers\Api\Leadership\LeadershipLeaveRequestController::class, 'show']);

        // 4. Executive Reports
        Route::get('/reports/attendance', [\App\Http\Controllers\Api\Leadership\LeadershipReportController::class, 'attendance']);
        Route::get('/reports/leave', [\App\Http\Controllers\Api\Leadership\LeadershipReportController::class, 'leave']);

        Route::get('/status', function () {
            return response()->json([
                'success' => true,
                'message' => 'Leadership foundation ready.',
                'data' => null,
            ]);
        });
    });
});
