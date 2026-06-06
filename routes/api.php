<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\VendorController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\AssetRequestController;
use App\Http\Controllers\Api\V1\MaintenanceController; // <-- Pastikan ini di-import

Route::prefix('v1')->group(function () {
    
    // --- 1. RUTE PENYELAMAT ANTI ERROR 500 ---
    // Jika token tidak valid, Laravel akan melempar error 401 lewat sini, bukan error 500
    Route::get('/unauthenticated', function () {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    })->name('login');

    // --- 2. PUBLIC ROUTES (TIDAK BUTUH LOGIN) ---
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    });

    Route::get('scan/{kode_aset}', [\App\Http\Controllers\Api\V1\AssetController::class, 'scan']);

    // --- 3. PROTECTED ROUTES (BUTUH BEARER TOKEN) ---
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth Logout & Me
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
        
        // --- SEMUA ROLE BISA AKSES (Get Data & Profile) ---
        Route::get('profile', [\App\Http\Controllers\Api\V1\ProfileController::class, 'show']);
        Route::put('profile', [\App\Http\Controllers\Api\V1\ProfileController::class, 'update']);
        Route::put('profile/password', [\App\Http\Controllers\Api\V1\ProfileController::class, 'changePassword']);
        
        Route::get('notifications', [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::put('notifications/{id}/read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAsRead']);
        Route::put('notifications/read-all', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllAsRead']);

        // Endpoint GET (Read-only) terbuka untuk semua yang login
        Route::get('assets', [\App\Http\Controllers\Api\V1\AssetController::class, 'index']);
        Route::get('assets/{id}', [\App\Http\Controllers\Api\V1\AssetController::class, 'show']);
        Route::get('categories', [\App\Http\Controllers\Api\V1\CategoryController::class, 'index']);
        Route::get('locations', [\App\Http\Controllers\Api\V1\LocationController::class, 'index']);
        Route::get('vendors', [\App\Http\Controllers\Api\V1\VendorController::class, 'index']);
        Route::get('users', [\App\Http\Controllers\Api\V1\UserController::class, 'index']);
        Route::get('maintenances', [MaintenanceController::class, 'index']); // GET Maintenance
        Route::get('maintenances/{id}', [MaintenanceController::class, 'show']); // GET Single Maintenance
        Route::get('transfers', [\App\Http\Controllers\Api\V1\TransferController::class, 'index']);
        Route::get('disposals', [\App\Http\Controllers\Api\V1\DisposalController::class, 'index']);
        Route::get('dashboard/summary', [\App\Http\Controllers\Api\V1\DashboardController::class, 'summary']);
        
        Route::get('departments', [DepartmentController::class, 'index']);
        Route::get('asset-requests', [AssetRequestController::class, 'index']);

        // --- STAFF, ADMIN & SUPERADMIN BISA LAPOR (Create) ---
        Route::middleware('role:superadmin,admin,staff')->group(function () {
            Route::post('maintenances', [MaintenanceController::class, 'store']); // Create Maintenance
            Route::post('transfers', [\App\Http\Controllers\Api\V1\TransferController::class, 'store']);
            Route::post('asset-requests', [AssetRequestController::class, 'store']);
        });

        // --- HANYA ADMIN & SUPERADMIN (CRUD Master Data & Approval) ---
        Route::middleware('role:superadmin,admin')->group(function () {
            Route::post('assets', [\App\Http\Controllers\Api\V1\AssetController::class, 'store']);
            Route::put('assets/{id}', [\App\Http\Controllers\Api\V1\AssetController::class, 'update']);
            Route::delete('assets/{id}', [\App\Http\Controllers\Api\V1\AssetController::class, 'destroy']);

            Route::apiResource('categories', \App\Http\Controllers\Api\V1\CategoryController::class)->except('index');
            Route::apiResource('locations', \App\Http\Controllers\Api\V1\LocationController::class)->except('index');
            Route::apiResource('vendors', \App\Http\Controllers\Api\V1\VendorController::class)->except('index');
            Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class)->except('index');
            Route::apiResource('departments', DepartmentController::class)->except('index');
            
            Route::put('asset-requests/{id}/status', [AssetRequestController::class, 'updateStatus']);
            
            // Edit & Delete Maintenance
            Route::put('maintenances/{id}', [MaintenanceController::class, 'update']);
            Route::delete('maintenances/{id}', [MaintenanceController::class, 'destroy']);
            
            Route::put('transfers/{id}/approve', [\App\Http\Controllers\Api\V1\TransferController::class, 'approve']);
            Route::put('transfers/{id}/reject', [\App\Http\Controllers\Api\V1\TransferController::class, 'reject']);

            Route::prefix('reports')->group(function () {
                Route::get('usage', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetUsage']);
                Route::get('holders-history', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetHoldersHistory']);
                Route::get('depreciation', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetDepreciation']);
            });
        });

        // --- HANYA SUPERADMIN (High Risk Operations) ---
        Route::middleware('role:superadmin')->group(function () {
            Route::post('disposals', [\App\Http\Controllers\Api\V1\DisposalController::class, 'store']);
            Route::put('disposals/{id}/approve', [\App\Http\Controllers\Api\V1\DisposalController::class, 'approve']);
            Route::put('disposals/{id}/reject', [\App\Http\Controllers\Api\V1\DisposalController::class, 'reject']);
        });
    });
});