<?php

namespace App\Services;

use App\Helpers\AuditLogger;
use App\Modules\Settings\Models\CompanySetting;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use ZipArchive;

class BackupService
{
    /**
     * Resolve the target backup directory.
     */
    public function getBackupDirectory(): string
    {
        $setting = CompanySetting::instance();
        $customPath = trim($setting->backup_directory_path ?? '');

        if (!empty($customPath)) {
            $dir = $customPath;
        } else {
            $dir = config('backup.path', storage_path('app/backups'));
        }

        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true, true);
        }

        return $dir;
    }

    /**
     * Get storage and database stats.
     */
    public function getStorageStats(): array
    {
        $setting = CompanySetting::instance();
        $backupDir = $this->getBackupDirectory();

        // 1. Calculate DB Size
        $dbSizeBytes = 0;
        $connection = config('database.default');
        try {
            if ($connection === 'sqlite') {
                $dbPath = config('database.connections.sqlite.database');
                if ($dbPath !== ':memory:' && File::exists($dbPath)) {
                    $dbSizeBytes = File::size($dbPath);
                } else {
                    $dbSizeBytes = 1024 * 64;
                }
            } elseif ($connection === 'mysql') {
                $dbName = config('database.connections.mysql.database');
                $result = DB::select("
                    SELECT SUM(data_length + index_length) AS size 
                    FROM information_schema.TABLES 
                    WHERE table_schema = ?
                ", [$dbName]);
                $dbSizeBytes = (int) ($result[0]->size ?? 0);
            }
        } catch (Exception $e) {
            Log::warning('Could not calculate database size: ' . $e->getMessage());
        }

        // 2. Calculate Physical Documents Size in storage/app/public
        $publicStorage = storage_path('app/public');
        $filesSizeBytes = 0;
        $filesCount = 0;
        if (File::exists($publicStorage)) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($publicStorage, RecursiveDirectoryIterator::SKIP_DOTS)
            );
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $filesSizeBytes += $file->getSize();
                    $filesCount++;
                }
            }
        }

        // 3. Calculate Backup Directory Size & Files
        $backups = $this->listBackups();
        $totalBackupSize = array_sum(array_column($backups, 'size_bytes'));

        return [
            'db_size_bytes'          => $dbSizeBytes,
            'db_size_formatted'      => $this->formatBytes($dbSizeBytes),
            'files_size_bytes'       => $filesSizeBytes,
            'files_size_formatted'   => $this->formatBytes($filesSizeBytes),
            'files_count'            => $filesCount,
            'backups_count'          => count($backups),
            'backups_size_bytes'     => $totalBackupSize,
            'backups_size_formatted' => $this->formatBytes($totalBackupSize),
            'backup_directory'       => $backupDir,
            'is_directory_writable'  => is_writable($backupDir),
            'last_backup_at'         => $setting->backup_last_run_at ? \Carbon\Carbon::parse($setting->backup_last_run_at)->toIso8601String() : null,
            'last_backup_status'     => $setting->backup_last_status ?? 'NONE',
            'retention_days'         => (int) ($setting->backup_retention_days ?? 30),
            'auto_schedule'          => $setting->backup_auto_schedule ?? 'daily',
        ];
    }

    /**
     * Create full zip backup.
     */
    public function createBackup(bool $includeDb = true, bool $includeFiles = true): array
    {
        $backupDir = $this->getBackupDirectory();
        $timestamp = date('Y-m-d_His');
        $zipFilename = "backup_mikrotek_{$timestamp}.zip";
        $zipPath = $backupDir . DIRECTORY_SEPARATOR . $zipFilename;

        $tempDir = storage_path('app/temp_backup_' . uniqid());
        File::makeDirectory($tempDir, 0755, true, true);

        try {
            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new Exception("Tidak dapat membuat berkas arsip zip pada: {$zipPath}");
            }

            $totalFilesAdded = 0;

            // 1. Export Database
            if ($includeDb) {
                $sqlDumpFile = $tempDir . DIRECTORY_SEPARATOR . 'database_dump.sql';
                $this->exportDatabaseDump($sqlDumpFile);
                if (File::exists($sqlDumpFile)) {
                    $zip->addFile($sqlDumpFile, 'database/database_dump.sql');
                    $totalFilesAdded++;
                }
            }

            // 2. Collect Physical Documents & Render All System Document PDFs (Quotes, Invoices, Receipts, DO, Contracts, Payslips)
            if ($includeFiles) {
                // A. Uploaded storage files (logos, proof scans, attachments)
                $publicStorage = storage_path('app/public');
                if (File::exists($publicStorage)) {
                    $iterator = new RecursiveIteratorIterator(
                        new RecursiveDirectoryIterator($publicStorage, RecursiveDirectoryIterator::SKIP_DOTS)
                    );
                    foreach ($iterator as $file) {
                        if ($file->isFile() && $file->getSize() > 0) {
                            $relativePath = 'documents/uploads/' . substr($file->getPathname(), strlen($publicStorage) + 1);
                            $zip->addFile($file->getPathname(), $relativePath);
                            $totalFilesAdded++;
                        }
                    }
                }

                // B. Dynamically Rendered System Document PDFs
                $pdfTempDir = $tempDir . DIRECTORY_SEPARATOR . 'pdf_generated';
                $pdfStats = $this->generateAllDocumentPdfs($pdfTempDir);

                if (File::exists($pdfTempDir)) {
                    $pdfIterator = new RecursiveIteratorIterator(
                        new RecursiveDirectoryIterator($pdfTempDir, RecursiveDirectoryIterator::SKIP_DOTS)
                    );
                    foreach ($pdfIterator as $file) {
                        if ($file->isFile()) {
                            $relativePath = 'documents/pdf_generated/' . substr($file->getPathname(), strlen($pdfTempDir) + 1);
                            $zip->addFile($file->getPathname(), $relativePath);
                            $totalFilesAdded++;
                        }
                    }
                }
            }

            // 3. Add Manifest
            $manifest = [
                'system'             => 'Mikrotek Business Suite Neo',
                'version'            => '2.5.4',
                'created_at'         => date('c'),
                'included_database'  => $includeDb,
                'included_documents' => $includeFiles,
                'total_files_count'  => $totalFilesAdded,
                'php_version'        => PHP_VERSION,
                'db_driver'          => config('database.default'),
            ];
            $manifestJson = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            $zip->addFromString('backup_manifest.json', $manifestJson);

            $zip->close();

            // Calculate SHA-256 for integrity verification
            $sha256 = hash_file('sha256', $zipPath);
            $archiveSize = File::size($zipPath);

            // Update company setting record
            $setting = CompanySetting::instance();
            $setting->update([
                'backup_last_run_at' => now(),
                'backup_last_status' => 'SUCCESS',
            ]);

            // Enforce retention rotation
            $this->cleanOldBackups((int) ($setting->backup_retention_days ?? 30));

            AuditLogger::log(
                'CREATE',
                'SETTINGS',
                "Berhasil membuat backup sistem '{$zipFilename}' (" . $this->formatBytes($archiveSize) . ", {$totalFilesAdded} berkas).",
                'Backup',
                null
            );

            return [
                'status'         => 'success',
                'filename'       => $zipFilename,
                'file_path'      => $zipPath,
                'size_bytes'     => $archiveSize,
                'size_formatted' => $this->formatBytes($archiveSize),
                'sha256'         => $sha256,
                'total_files'    => $totalFilesAdded,
                'created_at'     => date('c'),
            ];
        } catch (Exception $e) {
            CompanySetting::instance()->update([
                'backup_last_run_at' => now(),
                'backup_last_status' => 'FAILED: ' . $e->getMessage(),
            ]);
            Log::error('Backup generation failed: ' . $e->getMessage());
            throw $e;
        } finally {
            // Clean up temporary work directory
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }
        }
    }

    /**
     * Export database dump to a specified destination file.
     */
    public function exportDatabaseDump(string $destinationPath): void
    {
        $connection = config('database.default');

        if ($connection === 'sqlite') {
            $dbPath = config('database.connections.sqlite.database');
            if ($dbPath !== ':memory:' && File::exists($dbPath)) {
                File::copy($dbPath, $destinationPath);
                return;
            }

            // Fallback for :memory: or when file copy is not feasible: dump schema and data
            $handle = fopen($destinationPath, 'w');
            if (!$handle) {
                throw new Exception("Gagal membuka file tujuan SQL dump: {$destinationPath}");
            }
            fwrite($handle, "-- ========================================================\n");
            fwrite($handle, "-- Mikrotek Business Suite Neo - SQLite Database Dump\n");
            fwrite($handle, "-- Generated At: " . date('Y-m-d H:i:s') . "\n");
            fwrite($handle, "-- ========================================================\n\n");
            fwrite($handle, "PRAGMA foreign_keys = OFF;\n\n");

            $tables = DB::select("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            foreach ($tables as $t) {
                if (!empty($t->sql)) {
                    fwrite($handle, "DROP TABLE IF EXISTS `{$t->name}`;\n");
                    fwrite($handle, $t->sql . ";\n");

                    $rows = DB::table($t->name)->get();
                    if ($rows->count() > 0) {
                        foreach ($rows->chunk(100) as $chunk) {
                            foreach ($chunk as $row) {
                                $cols = array_keys((array)$row);
                                $vals = [];
                                foreach ((array)$row as $val) {
                                    if (is_null($val)) {
                                        $vals[] = 'NULL';
                                    } elseif (is_numeric($val) && !is_string($val)) {
                                        $vals[] = $val;
                                    } else {
                                        $escaped = str_replace(["\\", "'", "\r", "\n"], ["\\\\", "\\'", "\\r", "\\n"], (string)$val);
                                        $vals[] = "'{$escaped}'";
                                    }
                                }
                                fwrite($handle, "INSERT INTO `{$t->name}` (`" . implode("`,`", $cols) . "`) VALUES (" . implode(",", $vals) . ");\n");
                            }
                        }
                    }
                    fwrite($handle, "\n");
                }
            }

            fwrite($handle, "PRAGMA foreign_keys = ON;\n");
            fclose($handle);
            return;
        }

        // MySQL / MariaDB Dump Generator (Native PHP streaming SQL generator)
        $tables = DB::select('SHOW TABLES');
        $dbName = config("database.connections.{$connection}.database");
        $tableKey = "Tables_in_{$dbName}";

        $handle = fopen($destinationPath, 'w');
        if (!$handle) {
            throw new Exception("Gagal membuka file tujuan SQL dump: {$destinationPath}");
        }

        fwrite($handle, "-- ========================================================\n");
        fwrite($handle, "-- Mikrotek Business Suite Neo - Database Backup\n");
        fwrite($handle, "-- Generated At: " . date('Y-m-d H:i:s') . "\n");
        fwrite($handle, "-- Database: {$dbName}\n");
        fwrite($handle, "-- ========================================================\n\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n");
        fwrite($handle, "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n");
        fwrite($handle, "SET NAMES utf8mb4;\n\n");

        foreach ($tables as $tableObj) {
            $props = get_object_vars($tableObj);
            $tableName = reset($props);

            // Structure
            $createTableResult = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $createTableSql = $createTableResult[0]->{'Create Table'} ?? '';

            fwrite($handle, "--\n-- Structure for table `{$tableName}`\n--\n");
            fwrite($handle, "DROP TABLE IF EXISTS `{$tableName}`;\n");
            fwrite($handle, $createTableSql . ";\n\n");

            // Data rows
            fwrite($handle, "--\n-- Data for table `{$tableName}`\n--\n");
            $rows = DB::table($tableName)->get();
            if ($rows->count() > 0) {
                foreach ($rows->chunk(100) as $chunk) {
                    $insertSql = "INSERT INTO `{$tableName}` VALUES ";
                    $valueSets = [];

                    foreach ($chunk as $row) {
                        $values = [];
                        foreach ((array)$row as $val) {
                            if (is_null($val)) {
                                $values[] = 'NULL';
                            } elseif (is_numeric($val) && !is_string($val)) {
                                $values[] = $val;
                            } else {
                                $escaped = str_replace(["\\", "'", "\r", "\n"], ["\\\\", "\\'", "\\r", "\\n"], $val);
                                $values[] = "'{$escaped}'";
                            }
                        }
                        $valueSets[] = "(" . implode(", ", $values) . ")";
                    }

                    $insertSql .= implode(",\n", $valueSets) . ";\n";
                    fwrite($handle, $insertSql);
                }
            }
            fwrite($handle, "\n");
        }

        fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
        fwrite($handle, "-- Backup completed at " . date('Y-m-d H:i:s') . "\n");
        fclose($handle);
    }

    /**
     * Direct sync of physical files and latest DB dump to external/NAS directory.
     */
    public function syncToExternalStorage(?string $customTargetPath = null): array
    {
        $targetDir = !empty($customTargetPath) ? $customTargetPath : $this->getBackupDirectory();

        if (!File::exists($targetDir)) {
            File::makeDirectory($targetDir, 0755, true, true);
        }

        $targetDocumentsDir = $targetDir . DIRECTORY_SEPARATOR . 'documents';
        if (!File::exists($targetDocumentsDir)) {
            File::makeDirectory($targetDocumentsDir, 0755, true, true);
        }

        $publicStorage = storage_path('app/public');
        $copiedCount = 0;
        $totalBytes = 0;

        // 1. Sync Document Files (Incremental copy)
        if (File::exists($publicStorage)) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($publicStorage, RecursiveDirectoryIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $rel = substr($file->getPathname(), strlen($publicStorage) + 1);
                    $dest = $targetDocumentsDir . DIRECTORY_SEPARATOR . $rel;
                    $destFolder = dirname($dest);

                    if (!File::exists($destFolder)) {
                        File::makeDirectory($destFolder, 0755, true, true);
                    }

                    // Check if file is new or modified
                    if (!File::exists($dest) || File::lastModified($file->getPathname()) > File::lastModified($dest) || File::size($file->getPathname()) !== File::size($dest)) {
                        File::copy($file->getPathname(), $dest);
                        $copiedCount++;
                        $totalBytes += $file->getSize();
                    }
                }
            }
        }

        // 2. Render and Sync All Physical System PDF Documents (Quotes, Invoices, Receipts, Delivery Orders, Contracts, Payslips)
        $targetPdfDir = $targetDocumentsDir . DIRECTORY_SEPARATOR . 'pdf_generated';
        $pdfStats = $this->generateAllDocumentPdfs($targetPdfDir);

        if (File::exists($targetPdfDir)) {
            $pdfIterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($targetPdfDir, RecursiveDirectoryIterator::SKIP_DOTS)
            );
            foreach ($pdfIterator as $file) {
                if ($file->isFile()) {
                    $copiedCount++;
                    $totalBytes += $file->getSize();
                }
            }
        }

        // 3. Export Latest DB Dump directly to the safe directory
        $dbDumpFile = $targetDir . DIRECTORY_SEPARATOR . 'database_latest.sql';
        $this->exportDatabaseDump($dbDumpFile);

        AuditLogger::log(
            'UPDATE',
            'SETTINGS',
            "Sinkronisasi fisik dokumen ke safe directory ({$targetDir}) berhasil diselesaikan. {$copiedCount} file disinkronkan.",
            'BackupSync',
            null
        );

        return [
            'status'         => 'success',
            'target_dir'     => $targetDir,
            'synced_count'   => $copiedCount,
            'synced_size'    => $this->formatBytes($totalBytes),
            'db_synced'      => true,
            'completed_at'   => date('c'),
        ];
    }

    /**
     * List all available backup archives across safe storage paths.
     */
    public function listBackups(): array
    {
        $directories = array_unique([
            $this->getBackupDirectory(),
            config('backup.path', storage_path('app/backups')),
            storage_path('app/backups'),
        ]);

        $backups = [];
        $seenFilenames = [];

        foreach ($directories as $dir) {
            if (!File::exists($dir)) {
                continue;
            }

            $files = File::glob(rtrim($dir, '/') . '/*.zip');
            if ($files === false || empty($files)) {
                $allFiles = File::files($dir);
                $files = [];
                foreach ($allFiles as $f) {
                    if (str_ends_with(strtolower($f->getFilename()), '.zip')) {
                        $files[] = $f->getPathname();
                    }
                }
            }

            foreach ($files as $file) {
                $filename = basename($file);
                if (isset($seenFilenames[$filename])) {
                    continue;
                }
                $seenFilenames[$filename] = true;

                $size = File::size($file);
                $modified = File::lastModified($file);

                $backups[] = [
                    'filename'         => $filename,
                    'file_path'        => $file,
                    'size_bytes'       => $size,
                    'size_formatted'   => $this->formatBytes($size),
                    'created_at'       => date('c', $modified),
                    'created_at_human' => date('d M Y, H:i:s', $modified),
                    'is_valid'         => $this->verifyZipIntegrity($file),
                ];
            }
        }

        // Sort descending by modified date
        usort($backups, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return $backups;
    }

    /**
     * Find a backup file path across search directories.
     */
    public function findBackupFile(string $filename): ?string
    {
        $cleanFilename = basename($filename);
        if (!str_ends_with(strtolower($cleanFilename), '.zip')) {
            return null;
        }

        $directories = array_unique([
            $this->getBackupDirectory(),
            config('backup.path', storage_path('app/backups')),
            storage_path('app/backups'),
        ]);

        foreach ($directories as $dir) {
            $path = $dir . DIRECTORY_SEPARATOR . $cleanFilename;
            if (File::exists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Delete a specific backup file safely.
     */
    public function deleteBackup(string $filename): bool
    {
        $targetFile = $this->findBackupFile($filename);

        if ($targetFile && File::exists($targetFile)) {
            File::delete($targetFile);
            AuditLogger::log('DELETE', 'SETTINGS', "Menghapus file backup '" . basename($filename) . "'.", 'Backup', null);
            return true;
        }

        return false;
    }

    /**
     * Clean old backups according to retention policy.
     */
    public function cleanOldBackups(?int $daysToKeep = 30): int
    {
        if ($daysToKeep <= 0) return 0;

        $backups = $this->listBackups();
        $thresholdTimestamp = strtotime("-{$daysToKeep} days");
        $deletedCount = 0;

        foreach ($backups as $backup) {
            $fileTimestamp = strtotime($backup['created_at']);
            if ($fileTimestamp < $thresholdTimestamp) {
                if ($this->deleteBackup($backup['filename'])) {
                    $deletedCount++;
                }
            }
        }

        return $deletedCount;
    }

    /**
     * Generate all physical PDF files for dynamic system documents (Quotes, Invoices, Kwitansi, Delivery Orders, Contracts, Payslips)
     * into a target directory.
     */
    public function generateAllDocumentPdfs(string $destinationDir): array
    {
        @ini_set('memory_limit', '512M');
        @set_time_limit(300);

        if (!File::exists($destinationDir)) {
            File::makeDirectory($destinationDir, 0755, true, true);
        }

        $company = CompanySetting::instance();
        $bankAccounts = \App\Modules\Settings\Models\CompanyBankAccount::where('is_active', true)->orderBy('is_primary', 'desc')->get();
        $stats = [
            'quotes'          => 0,
            'invoices'        => 0,
            'receipts'        => 0,
            'delivery_orders' => 0,
            'contracts'       => 0,
            'payslips'        => 0,
        ];

        // 1. Quotes / Penawaran
        $quotesDir = $destinationDir . DIRECTORY_SEPARATOR . 'quotes';
        File::makeDirectory($quotesDir, 0755, true, true);
        $tmplKey = $company->quote_template ?: 'modern';
        $tmpl = \App\Helpers\QuoteTemplateRegistry::find($tmplKey);

        \App\Modules\Quotes\Models\Quote::with(['client', 'items.product'])->chunk(50, function ($quotes) use ($quotesDir, $company, $tmpl, &$stats) {
            foreach ($quotes as $q) {
                try {
                    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($tmpl['blade_view'], [
                        'quote'    => $q,
                        'company'  => $company,
                        'template' => $tmpl,
                    ]);
                    $pdf->setPaper($tmpl['paper'] ?? 'a4', $tmpl['orientation'] ?? 'portrait');
                    $cleanNum = str_replace(['/', '\\'], '_', $q->quote_number ?: "Quote_{$q->id}");
                    $filename = "Penawaran_{$cleanNum}.pdf";
                    File::put($quotesDir . DIRECTORY_SEPARATOR . $filename, $pdf->output());
                    $stats['quotes']++;
                } catch (\Throwable $e) {
                    Log::warning("Failed to render backup quote PDF #{$q->id}: " . $e->getMessage());
                }
            }
        });

        // 2. Invoices / Tagihan
        $invoicesDir = $destinationDir . DIRECTORY_SEPARATOR . 'invoices';
        File::makeDirectory($invoicesDir, 0755, true, true);
        $tmplKey = $company->invoice_template ?: 'modern';
        $tmpl = \App\Helpers\InvoiceTemplateRegistry::find($tmplKey);

        \App\Modules\Invoices\Models\Invoice::with(['client', 'items'])->chunk(50, function ($invoices) use ($invoicesDir, $company, $bankAccounts, $tmpl, &$stats) {
            foreach ($invoices as $inv) {
                try {
                    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($tmpl['blade_view'], [
                        'invoice'      => $inv,
                        'company'      => $company,
                        'bankAccounts' => $bankAccounts,
                        'template'     => $tmpl,
                    ]);
                    $pdf->setPaper($tmpl['paper'] ?? 'a4', $tmpl['orientation'] ?? 'portrait');
                    $cleanNum = str_replace(['/', '\\'], '_', $inv->invoice_number ?: "Invoice_{$inv->id}");
                    $filename = "Invoice_{$cleanNum}.pdf";
                    File::put($invoicesDir . DIRECTORY_SEPARATOR . $filename, $pdf->output());
                    $stats['invoices']++;
                } catch (\Throwable $e) {
                    Log::warning("Failed to render backup invoice PDF #{$inv->id}: " . $e->getMessage());
                }
            }
        });

        // 3. Receipts / Kwitansi
        $receiptsDir = $destinationDir . DIRECTORY_SEPARATOR . 'receipts';
        File::makeDirectory($receiptsDir, 0755, true, true);
        $tmplKey = $company->receipt_template ?: 'modern';
        $tmpl = \App\Helpers\ReceiptTemplateRegistry::find($tmplKey);

        \App\Modules\Payments\Models\Payment::with(['invoice.client', 'paymentMethod'])->chunk(50, function ($payments) use ($receiptsDir, $company, $tmpl, &$stats) {
            foreach ($payments as $p) {
                try {
                    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($tmpl['blade_view'], [
                        'payment'  => $p,
                        'company'  => $company,
                        'template' => $tmpl,
                    ]);
                    $pdf->setPaper($tmpl['paper'] ?? 'a4', $tmpl['orientation'] ?? 'portrait');
                    $cleanNum = str_replace(['/', '\\'], '_', $p->payment_number ?: "Payment_{$p->id}");
                    $filename = "Kwitansi_{$cleanNum}.pdf";
                    File::put($receiptsDir . DIRECTORY_SEPARATOR . $filename, $pdf->output());
                    $stats['receipts']++;
                } catch (\Throwable $e) {
                    Log::warning("Failed to render backup payment receipt PDF #{$p->id}: " . $e->getMessage());
                }
            }
        });

        // 4. Delivery Orders / Surat Jalan
        $doDir = $destinationDir . DIRECTORY_SEPARATOR . 'delivery_orders';
        File::makeDirectory($doDir, 0755, true, true);

        \App\Modules\DeliveryOrders\Models\DeliveryOrder::with(['client', 'invoice', 'project', 'items.product', 'creator'])->chunk(50, function ($dos) use ($doDir, $company, &$stats) {
            foreach ($dos as $do) {
                try {
                    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.delivery_order', [
                        'do'      => $do,
                        'company' => $company,
                    ]);
                    $pdf->setPaper('a4', 'portrait');
                    $cleanNum = str_replace(['/', '\\'], '_', $do->do_number ?: "DO_{$do->id}");
                    $filename = "Surat_Jalan_{$cleanNum}.pdf";
                    File::put($doDir . DIRECTORY_SEPARATOR . $filename, $pdf->output());
                    $stats['delivery_orders']++;
                } catch (\Throwable $e) {
                    Log::warning("Failed to render backup DO PDF #{$do->id}: " . $e->getMessage());
                }
            }
        });

        // 5. Employee Contracts / Kontrak Kerja
        $contractsDir = $destinationDir . DIRECTORY_SEPARATOR . 'contracts';
        File::makeDirectory($contractsDir, 0755, true, true);

        if (class_exists('\App\Modules\HR\Models\EmployeeContract')) {
            \App\Modules\HR\Models\EmployeeContract::with(['employee'])->chunk(50, function ($contracts) use ($contractsDir, $company, &$stats) {
                foreach ($contracts as $c) {
                    try {
                        $tmplKey = $c->template_key ?: ($company->contract_template ?: 'standard');
                        $tmpl = \App\Helpers\ContractTemplateRegistry::find($tmplKey);
                        $employee = $c->employee;
                        if (!$employee) continue;

                        $contractData = [
                            'number'           => $c->contract_number ?: "PK-{$c->id}",
                            'contract_number'  => $c->contract_number ?: "PK-{$c->id}",
                            'title'            => $c->title,
                            'position'         => $c->position_title ?: $employee->position,
                            'date'             => $c->contract_date ? $c->contract_date->toDateString() : now()->toDateString(),
                            'start_date'       => $c->start_date ? $c->start_date->toDateString() : null,
                            'end_date'         => $c->end_date ? $c->end_date->toDateString() : null,
                            'basic_salary'     => $c->base_salary,
                            'signer_name'      => $c->signer_name ?: $company->signature_signer_name,
                            'signer_title'     => $c->signer_position ?: $company->signature_signer_title,
                            'probation_period' => $c->trial_period_months ? $c->trial_period_months . ' Bulan' : null,
                            'work_location'    => $c->work_location,
                            'additional_terms' => $c->additional_terms,
                        ];

                        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($tmpl['blade_view'], [
                            'employee' => $employee,
                            'company'  => $company,
                            'template' => $tmpl,
                            'contract' => $contractData,
                        ]);
                        $pdf->setPaper($tmpl['paper'] ?? 'a4', $tmpl['orientation'] ?? 'portrait');
                        $safeName = str_replace(['/', '\\', ' '], '_', $employee->full_name);
                        $safeNum = str_replace(['/', '\\'], '-', $c->contract_number ?: "Contract_{$c->id}");
                        $filename = "Kontrak_{$safeNum}_{$safeName}.pdf";
                        File::put($contractsDir . DIRECTORY_SEPARATOR . $filename, $pdf->output());
                        $stats['contracts']++;
                    } catch (\Throwable $e) {
                        Log::warning("Failed to render backup contract PDF #{$c->id}: " . $e->getMessage());
                    }
                }
            });
        }

        // 6. Payslips / Slip Gaji
        $payslipsDir = $destinationDir . DIRECTORY_SEPARATOR . 'payslips';
        File::makeDirectory($payslipsDir, 0755, true, true);

        if (class_exists('\App\Modules\HR\Models\Payslip')) {
            \App\Modules\HR\Models\Payslip::with(['employee', 'period'])->chunk(50, function ($payslips) use ($payslipsDir, $company, &$stats) {
                foreach ($payslips as $ps) {
                    try {
                        $templateKey = $company->payslip_template ?: 'modern';
                        $template = \App\Helpers\PayslipTemplateRegistry::find($templateKey);
                        $verifyUrl = config('app.url') . "/portal/payslip/verify/" . ($ps->public_token ?? $ps->id);
                        $qrCodeSvg = \App\Helpers\QrCodeGenerator::generateSvgDataUri($verifyUrl, 80);

                        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($template['blade_view'], [
                            'payslip'   => $ps,
                            'period'    => $ps->period,
                            'employee'  => $ps->employee,
                            'company'   => $company,
                            'template'  => $template,
                            'qrCodeSvg' => $qrCodeSvg,
                        ]);
                        $pdf->setPaper($template['paper'] ?? 'a4', $template['orientation'] ?? 'portrait');
                        $safeNum = str_replace(['/', '\\', ' '], '_', $ps->payslip_number ?: "SLIP_{$ps->id}");
                        $safeName = str_replace(['/', '\\', ' '], '_', $ps->employee->full_name ?? 'Employee');
                        $filename = "Slip_Gaji_{$safeNum}_{$safeName}.pdf";
                        File::put($payslipsDir . DIRECTORY_SEPARATOR . $filename, $pdf->output());
                        $stats['payslips']++;
                    } catch (\Throwable $e) {
                        Log::warning("Failed to render backup payslip PDF #{$ps->id}: " . $e->getMessage());
                    }
                }
            });
        }

        return $stats;
    }

    /**
     * Verify zip archive integrity.
     */
    private function verifyZipIntegrity(string $path): bool
    {
        $zip = new ZipArchive();
        $res = $zip->open($path, ZipArchive::CHECKCONS);
        if ($res === true) {
            $zip->close();
            return true;
        }
        return false;
    }

    /**
     * Helper to format bytes into readable string (KB, MB, GB).
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        if ($bytes <= 0) return '0 B';
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $power = floor(log($bytes, 1024));
        return round($bytes / pow(1024, $power), $precision) . ' ' . ($units[$power] ?? 'B');
    }
}
