<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    $spaIndex = public_path('index.html');
    if (file_exists($spaIndex)) {
        return response()->file($spaIndex);
    }
    return response()->json([
        'app' => 'STKIP Usman Safri Attendance System API',
        'status' => 'active',
        'version' => '1.0.0'
    ]);
});

Route::fallback(function () {
    $spaIndex = public_path('index.html');
    if (file_exists($spaIndex)) {
        return response()->file($spaIndex);
    }
    return response()->json(['message' => 'Resource not found'], 404);
});
