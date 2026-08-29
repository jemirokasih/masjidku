<?php

namespace App\Helpers;

use App\Modules\AuditLogs\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Log a user activity/change to audit trail.
     */
    public static function log(
        string $action,
        string $module,
        string $description,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): ?AuditLog {
        try {
            $user = Auth::user();

            return AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'System / Anonymous',
                'user_role' => $user?->role ?? 'system',
                'ip_address' => Request::ip() ?? '127.0.0.1',
                'user_agent' => Request::userAgent() ?? 'System Process',
                'module' => strtoupper($module),
                'action' => strtoupper($action),
                'entity_type' => $entityType,
                'entity_id' => $entityId ? (string)$entityId : null,
                'description' => $description,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            \Log::error('AuditLogger error: ' . $e->getMessage());
            return null;
        }
    }
}
