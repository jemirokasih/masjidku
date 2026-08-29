<?php

use App\Http\Controllers\Api\Admin\MasjidVerificationController;
use App\Http\Controllers\Api\Admin\ThemeMarketplaceController as AdminThemeMarketplaceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Public\WebsiteController;
use App\Http\Controllers\Api\Tenant\DonationController;
use App\Http\Controllers\Api\Tenant\MasjidProfileController;
use App\Http\Controllers\Api\Tenant\PageController;
use App\Http\Controllers\Api\Tenant\PostController;
use App\Http\Controllers\Api\Tenant\ThemeController as TenantThemeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Masjidku SaaS Platform
|--------------------------------------------------------------------------
*/

// Authentication Routes
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Platform Admin Routes (Super Admin)
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'check_role:platform_admin,admin,administrator'])->group(function () {
    // Mosque Verification
    Route::get('/masjids', [MasjidVerificationController::class, 'index']);
    Route::get('/masjids/{id}', [MasjidVerificationController::class, 'show']);
    Route::post('/masjids/{id}/verify', [MasjidVerificationController::class, 'verify']);

    // Theme Marketplace Management
    Route::apiResource('/themes', AdminThemeMarketplaceController::class);
});

// Mosque Admin (Pengurus Masjid) CMS Routes
Route::prefix('v1/tenant')->middleware(['auth:sanctum', 'check_role:pengurus_masjid,admin,administrator'])->group(function () {
    // Mosque Profile & Info Settings
    Route::get('/masjid', [MasjidProfileController::class, 'show']);
    Route::put('/masjid', [MasjidProfileController::class, 'update']);
    Route::post('/masjid', [MasjidProfileController::class, 'update']);
    Route::put('/masjid/info', [MasjidProfileController::class, 'updateInfo']);
    Route::post('/masjid/info', [MasjidProfileController::class, 'updateInfo']);

    // Berita & Update Kajian / Agenda
    Route::apiResource('/posts', PostController::class);

    // Donasi & Infaq
    Route::apiResource('/donations', DonationController::class);

    // Custom Static Pages (CMS Halaman Profil, Sejarah, DKM, Laporan)
    Route::apiResource('/pages', PageController::class);

    // Theme Marketplace & Selection
    Route::get('/themes', [TenantThemeController::class, 'index']);
    Route::post('/themes/select', [TenantThemeController::class, 'select']);
});

// Public Tenant Website API
Route::prefix('v1/public')->group(function () {
    Route::get('/masjid/{identifier}', [WebsiteController::class, 'showWebsite']);
    Route::get('/masjid/{identifier}/posts', [WebsiteController::class, 'getPosts']);
    Route::get('/masjid/{identifier}/posts/{postSlug}', [WebsiteController::class, 'getPostDetail']);
    Route::get('/masjid/{identifier}/donations', [WebsiteController::class, 'getDonations']);
});
