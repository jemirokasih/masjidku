<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Models\CompanySetting;
use App\Services\BackupService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    protected BackupService $backupService;

    public function __construct(BackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    /**
     * Get storage statistics and backup configuration status.
     */
    public function stats(): JsonResponse
    {
        $stats = $this->backupService->getStorageStats();

        return response()->json([
            'status' => 'success',
            'data'   => $stats,
        ]);
    }

    /**
     * List all available backup files.
     */
    public function index(): JsonResponse
    {
        $backups = $this->backupService->listBackups();

        return response()->json([
            'status' => 'success',
            'data'   => $backups,
        ]);
    }

    /**
     * Trigger manual instant backup generation.
     */
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'include_db'    => ['sometimes', 'boolean'],
            'include_files' => ['sometimes', 'boolean'],
        ]);

        $includeDb = $validated['include_db'] ?? true;
        $includeFiles = $validated['include_files'] ?? true;

        try {
            $result = $this->backupService->createBackup($includeDb, $includeFiles);

            return response()->json([
                'status'  => 'success',
                'message' => 'Proses backup berhasil diselesaikan.',
                'data'    => $result,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal membuat backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Trigger physical direct sync to safe storage / NAS.
     */
    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'custom_target_path' => ['nullable', 'string'],
        ]);

        try {
            $result = $this->backupService->syncToExternalStorage($validated['custom_target_path'] ?? null);

            return response()->json([
                'status'  => 'success',
                'message' => 'Sinkronisasi fisik dokumen ke safe directory berhasil.',
                'data'    => $result,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal melakukan sinkronisasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download backup archive zip file.
     */
    public function download(string $filename): BinaryFileResponse|JsonResponse
    {
        $cleanFilename = basename($filename);
        $filePath = $this->backupService->findBackupFile($cleanFilename);

        if (!$filePath || !File::exists($filePath)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Berkas arsip backup tidak ditemukan.',
            ], 404);
        }

        return response()->download($filePath, $cleanFilename, [
            'Content-Type' => 'application/zip',
        ]);
    }

    /**
     * Delete a backup file.
     */
    public function destroy(string $filename): JsonResponse
    {
        $deleted = $this->backupService->deleteBackup($filename);

        if (!$deleted) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Berkas backup gagal dihapus atau tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Berkas backup berhasil dihapus.',
        ]);
    }

    /**
     * Update backup directory path and retention settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'backup_directory_path' => ['nullable', 'string'],
            'backup_retention_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'backup_auto_schedule'  => ['required', 'in:daily,weekly,disabled'],
            'backup_driver'         => ['required', 'in:local,sftp,s3'],
        ]);

        $setting = CompanySetting::instance();
        $setting->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengaturan backup & safe storage berhasil disimpan.',
            'data'    => $this->backupService->getStorageStats(),
        ]);
    }
}

