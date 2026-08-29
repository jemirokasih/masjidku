<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Safe Backup & Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for storing physical document archives and database dumps.
    | The backup directory can point to a local directory, a mounted NAS
    | (NFS/SMB), external drive, or secondary safe storage path.
    |
    */

    'path' => env('BACKUP_DIRECTORY_PATH', storage_path('app/backups')),

    'retention_days' => (int) env('BACKUP_RETENTION_DAYS', 30),

    'max_backups' => (int) env('BACKUP_MAX_FILES', 20),

    'source_directories' => [
        'public' => storage_path('app/public'),
    ],

    'excluded_paths' => [
        'public/build',
        'public/hot',
    ],
];

