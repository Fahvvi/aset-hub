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
        
        // Master Data
        Route::get('users', [\App\Http\Controllers\Api\V1\UserController::class, 'index']);
        Route::apiResource('categories', CategoryController::class); 
        Route::apiResource('locations', LocationController::class);
        Route::apiResource('vendors', VendorController::class);

        // Asset Routes
        Route::apiResource('assets', \App\Http\Controllers\Api\V1\AssetController::class);

        Route::apiResource('maintenances', \App\Http\Controllers\Api\V1\MaintenanceController::class);
    });
});