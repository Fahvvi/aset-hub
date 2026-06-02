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
        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        
        // Dashboard
        Route::get('dashboard/summary', [\App\Http\Controllers\Api\V1\DashboardController::class, 'summary']);
        // Master Data
        Route::get('users', [\App\Http\Controllers\Api\V1\UserController::class, 'index']);
        Route::apiResource('categories', CategoryController::class); 
        Route::apiResource('locations', LocationController::class);
        Route::apiResource('vendors', VendorController::class);

        // Asset Routes
        Route::apiResource('assets', \App\Http\Controllers\Api\V1\AssetController::class);

        Route::apiResource('maintenances', \App\Http\Controllers\Api\V1\MaintenanceController::class);
    
        // Transfer Routes
        Route::get('transfers', [\App\Http\Controllers\Api\V1\TransferController::class, 'index']);
        Route::post('transfers', [\App\Http\Controllers\Api\V1\TransferController::class, 'store']);
        Route::put('transfers/{id}/approve', [\App\Http\Controllers\Api\V1\TransferController::class, 'approve']);
        Route::put('transfers/{id}/reject', [\App\Http\Controllers\Api\V1\TransferController::class, 'reject']);

        // Disposal Routes
        Route::get('disposals', [\App\Http\Controllers\Api\V1\DisposalController::class, 'index']);
        Route::post('disposals', [\App\Http\Controllers\Api\V1\DisposalController::class, 'store']);
        Route::put('disposals/{id}/approve', [\App\Http\Controllers\Api\V1\DisposalController::class, 'approve']);
        Route::put('disposals/{id}/reject', [\App\Http\Controllers\Api\V1\DisposalController::class, 'reject']);


        Route::prefix('reports')->group(function () {
        Route::get('usage', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetUsage']);
        Route::get('holders-history', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetHoldersHistory']);
        Route::get('depreciation', [\App\Http\Controllers\Api\V1\ReportController::class, 'assetDepreciation']);

        // Profile
        Route::get('profile', [\App\Http\Controllers\Api\V1\ProfileController::class, 'show']);
        Route::put('profile', [\App\Http\Controllers\Api\V1\ProfileController::class, 'update']);
        Route::put('profile/password', [\App\Http\Controllers\Api\V1\ProfileController::class, 'changePassword']);

        // Notifications
        Route::get('notifications', [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::put('notifications/{id}/read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAsRead']);
        Route::put('notifications/read-all', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllAsRead']);

    
        });

        });
});