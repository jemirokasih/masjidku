<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Exception;
use Illuminate\Console\Command;

class BackupRunCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:run 
                            {--db-only : Backup database only} 
                            {--files-only : Backup physical documents only}
                            {--sync : Directly sync files to safe storage/NAS}
                            {--target= : Custom safe destination directory path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a secure backup of database and physical documents, or sync to NAS/safe directory';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService): int
    {
        $isSync = $this->option('sync');
        $target = $this->option('target');
        $dbOnly = $this->option('db-only');
        $filesOnly = $this->option('files-only');

        $this->info('Memulai proses backup Mikrotek Business Suite Neo...');

        try {
            if ($isSync) {
                $this->line('Menyinkronkan dokumen fisik dan database ke safe storage...');
                $result = $backupService->syncToExternalStorage($target);
                $this->info("✓ Sinkronisasi selesai: {$result['synced_count']} berkas ({$result['synced_size']}) disalin ke {$result['target_dir']}");
                return self::SUCCESS;
            }

            $includeDb = !$filesOnly;
            $includeFiles = !$dbOnly;

            $this->line('Mengumpulkan database snapshot dan berkas dokumen...');
            $result = $backupService->createBackup($includeDb, $includeFiles);

            $this->info("✓ Backup berhasil dibuat!");
            $this->table(
                ['Parameter', 'Nilai'],
                [
                    ['Nama Berkas', $result['filename']],
                    ['Ukuran', $result['size_formatted']],
                    ['Total Berkas', $result['total_files']],
                    ['SHA-256 Checksum', $result['sha256']],
                    ['Lokasi', $result['file_path']],
                ]
            );

            return self::SUCCESS;
        } catch (Exception $e) {
            $this->error('✗ Gagal memproses backup: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}

