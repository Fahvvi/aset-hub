<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\VendorController;

Route::prefix('v1')->group(function () {
    // Public Routes
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected Routes (Butuh Bearer Token)
    Route::middleware('auth:sanctum')->group(function () {
    
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
    Route::get('maintenances', [\App\Http\Controllers\Api\V1\MaintenanceController::class, 'index']);
    Route::get('transfers', [\App\Http\Controllers\Api\V1\TransferController::class, 'index']);
    Route::get('disposals', [\App\Http\Controllers\Api\V1\DisposalController::class, 'index']);
    Route::get('dashboard/summary', [\App\Http\Controllers\Api\V1\DashboardController::class, 'summary']);

    // --- STAFF, ADMIN & SUPERADMIN BISA LAPOR (Create) ---
    Route::middleware('role:superadmin,admin,staff')->group(function () {
        Route::post('maintenances', [\App\Http\Controllers\Api\V1\MaintenanceController::class, 'store']);
        Route::post('transfers', [\App\Http\Controllers\Api\V1\TransferController::class, 'store']);
    });

    // --- HANYA ADMIN & SUPERADMIN (CRUD Master Data & Approval) ---
    Route::middleware('role:superadmin,admin')->group(function () {
        // Modul Aset
        Route::post('assets', [\App\Http\Controllers\Api\V1\AssetController::class, 'store']);
        Route::put('assets/{id}', [\App\Http\Controllers\Api\V1\AssetController::class, 'update']);
        Route::delete('assets/{id}', [\App\Http\Controllers\Api\V1\AssetController::class, 'destroy']);

        // Modul Master (Categories, Locations, Vendors) - Gunakan apiResource selain index
        Route::apiResource('categories', \App\Http\Controllers\Api\V1\CategoryController::class)->except('index');
        Route::apiResource('locations', \App\Http\Controllers\Api\V1\LocationController::class)->except('index');
        Route::apiResource('vendors', \App\Http\Controllers\Api\V1\VendorController::class)->except('index');

        // Modul Operations (Proses & Approval)
        Route::put('maintenances/{id}', [\App\Http\Controllers\Api\V1\MaintenanceController::class, 'update']);
        Route::delete('maintenances/{id}', [\App\Http\Controllers\Api\V1\MaintenanceController::class, 'destroy']);
        
        Route::put('transfers/{id}/approve', [\App\Http\Controllers\Api\V1\TransferController::class, 'approve']);
        Route::put('transfers/{id}/reject', [\App\Http\Controllers\Api\V1\TransferController::class, 'reject']);

        // Laporan (Finance & Report Center)
        Route::prefix('reports')->group(function () {
            Route::get('usage', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetUsage']);
            Route::get('holders-history', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetHoldersHistory']);
            Route::get('depreciation', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetDepreciation']);
        });
    });

    // --- HANYA SUPERADMIN (High Risk Operations) ---
    Route::middleware('role:superadmin')->group(function () {
        // Pengajuan & Approval Penghapusan Aset
        Route::post('disposals', [\App\Http\Controllers\Api\V1\DisposalController::class, 'store']);
        Route::put('disposals/{id}/approve', [\App\Http\Controllers\Api\V1\DisposalController::class, 'approve']);
        Route::put('disposals/{id}/reject', [\App\Http\Controllers\Api\V1\DisposalController::class, 'reject']);
    });
});
});