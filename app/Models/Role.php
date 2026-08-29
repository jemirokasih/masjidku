<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $table = 'mbs_roles';

    protected $fillable = [
        'name',
        'label',
        'description',
        'permissions',
        'is_system',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role', 'name');
    }

    /**
     * Check if role has a specific module or action permission
     */
    public function hasPermission(string $permission): bool
    {
        if (in_array(strtolower($this->name), ['admin', 'administrator', 'superadmin'], true)) {
            return true;
        }

        $perms = $this->permissions ?? [];
        if (is_string($perms)) {
            $perms = json_decode($perms, true) ?? [];
        }
        if (!is_array($perms)) {
            $perms = [];
        }

        if (in_array('*', $perms, true) || in_array($permission, $perms, true)) {
            return true;
        }

        $parts = explode('.', $permission);
        $module = $parts[0];

        if (in_array($module, $perms, true)) {
            return true;
        }

        foreach ($perms as $p) {
            if ($p === $module || str_starts_with($p, $module . '.')) {
                return true;
            }
        }

        return false;
    }
}
