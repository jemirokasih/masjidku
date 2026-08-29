<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request for role-based access control (RBAC).
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $userRole = strtolower($user->role ?? '');

        // Administrator / Admin / Superadmin is the root account and bypasses ALL role restrictions
        if (in_array($userRole, ['administrator', 'admin', 'superadmin'], true)) {
            return $next($request);
        }

        // Normalize allowed roles
        $allowedRoles = array_map('strtolower', $roles);
        if (in_array('admin', $allowedRoles, true)) {
            $allowedRoles[] = 'administrator';
            $allowedRoles[] = 'superadmin';
        }

        // Check if user's role is permitted directly
        if (in_array($userRole, $allowedRoles, true)) {
            return $next($request);
        }

        // Dynamic Role Permission Fallback
        $roleModel = Role::where('name', $userRole)->first();
        if ($roleModel) {
            foreach ($allowedRoles as $allowedRole) {
                if ($roleModel->hasPermission($allowedRole)) {
                    return $next($request);
                }
            }
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Akses ditolak. Peranan Anda (' . strtoupper($user->role ?? 'GUEST') . ') tidak memiliki wewenang untuk mengakses sumber daya ini.',
        ], 403);
    }
}
