<?php

namespace App\Console\Commands;

use App\Modules\Settings\Models\CompanySetting;
use App\Services\BackupService;
use Illuminate\Console\Command;

class BackupCleanCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:clean {--days= : Retention days to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean old backup archives based on retention policy';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService): int
    {
        $setting = CompanySetting::instance();
        $days = (int) ($this->option('days') ?? $setting->backup_retention_days ?? 30);

        $this->line("Membersihkan arsip backup yang berusia lebih dari {$days} hari...");
        $deletedCount = $backupService->cleanOldBackups($days);

        $this->info("✓ Selesai. {$deletedCount} berkas backup lama telah dihapus.");

        return self::SUCCESS;
    }
}

