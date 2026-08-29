<?php

namespace App\Helpers;

use App\Modules\Notifications\Models\Notification;
use App\Modules\HR\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationHelper
{
    /**
     * Send notification to a specific User ID.
     */
    public static function sendToUser(int $userId, string $title, string $message, string $type = 'info', ?string $link = null): ?Notification
    {
        try {
            return Notification::create([
                'user_id' => $userId,
                'role' => null,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'link' => $link,
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create user notification: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send notification to an Employee (looks up user_id).
     */
    public static function sendToEmployee(int $employeeId, string $title, string $message, string $type = 'info', ?string $link = null): ?Notification
    {
        try {
            $employee = Employee::find($employeeId);
            if ($employee && $employee->user_id) {
                return self::sendToUser($employee->user_id, $title, $message, $type, $link);
            }
            // If employee has no user_id, fallback to broadcast to HR role so HR sees it
            self::sendToRole('hr', $title, "({$employee?->full_name}) {$message}", $type, $link);
            return null;
        } catch (\Throwable $e) {
            Log::error('Failed to create employee notification: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send notification to a specific role or array of roles (e.g. 'admin', 'hr', 'finance', 'project_manager').
     */
    public static function sendToRole(string|array $roles, string $title, string $message, string $type = 'info', ?string $link = null): void
    {
        try {
            $roleList = is_array($roles) ? $roles : explode(',', $roles);
            foreach ($roleList as $role) {
                $trimmed = strtolower(trim($role));
                if (!empty($trimmed)) {
                    Notification::create([
                        'user_id' => null,
                        'role' => $trimmed,
                        'title' => $title,
                        'message' => $message,
                        'type' => $type,
                        'link' => $link,
                        'is_read' => false,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to create role notification: ' . $e->getMessage());
        }
    }

    /**
     * Send notification to all administrators (admin, superadmin, administrator).
     */
    public static function notifyAdmins(string $title, string $message, string $type = 'info', ?string $link = null): void
    {
        self::sendToRole(['admin', 'administrator', 'superadmin'], $title, $message, $type, $link);
    }

    /**
     * Send notification broadcast to everyone.
     */
    public static function sendToAll(string $title, string $message, string $type = 'system', ?string $link = null): ?Notification
    {
        try {
            return Notification::create([
                'user_id' => null,
                'role' => null,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'link' => $link,
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to broadcast notification: ' . $e->getMessage());
            return null;
        }
    }
}
