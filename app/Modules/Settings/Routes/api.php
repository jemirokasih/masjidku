<?php

use App\Modules\Settings\Controllers\SettingsController;
use App\Modules\Settings\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:superadmin,admin'])->group(function () {
    // Company Settings & SMTP
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::put('/settings', [SettingsController::class, 'update']);
    Route::post('/settings/signature-image', [SettingsController::class, 'uploadSignatureImage']);
    Route::post('/settings/smtp/test', [SettingsController::class, 'testSmtp']);

    // System Backup & Safe Storage
    Route::get('/settings/backup/stats', [\App\Http\Controllers\Api\BackupController::class, 'stats']);
    Route::get('/settings/backup/list', [\App\Http\Controllers\Api\BackupController::class, 'index']);
    Route::post('/settings/backup/create', [\App\Http\Controllers\Api\BackupController::class, 'create']);
    Route::post('/settings/backup/sync', [\App\Http\Controllers\Api\BackupController::class, 'sync']);
    Route::get('/settings/backup/download/{filename}', [\App\Http\Controllers\Api\BackupController::class, 'download']);
    Route::delete('/settings/backup/{filename}', [\App\Http\Controllers\Api\BackupController::class, 'destroy']);
    Route::post('/settings/backup/settings', [\App\Http\Controllers\Api\BackupController::class, 'updateSettings']);

    // Users / RBAC Management
    Route::apiResource('users', UserController::class);

    // Dynamic Role Management
    Route::get('/roles/modules', [\App\Http\Controllers\RoleController::class, 'modules']);
    Route::apiResource('roles', \App\Http\Controllers\RoleController::class);
});
