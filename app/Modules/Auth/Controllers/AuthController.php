<?php

namespace App\Modules\Auth\Controllers;

use App\Helpers\AuditLogger;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user & return API token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang Anda masukkan salah.'],
            ]);
        }

        if (isset($user->is_active) && !$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi admin.'],
            ]);
        }

        // Revoke old tokens & create new one
        $user->tokens()->delete();
        $token = $user->createToken('mbs_auth_token')->plainTextToken;

        // Log audit trail for login
        AuditLogger::log('LOGIN', 'AUTH', "Pengguna {$user->name} ({$user->email}) berhasil login ke sistem.", 'User', $user->id);

        $roleModel = \App\Models\Role::where('name', $user->role)->first();
        $permissions = in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin'], true)
            ? ['*']
            : ($roleModel ? ($roleModel->permissions ?? []) : []);

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'administrator',
                    'permissions' => $permissions,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Get current authenticated user profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $roleModel = \App\Models\Role::where('name', $user->role)->first();
        $permissions = in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin'], true)
            ? ['*']
            : ($roleModel ? ($roleModel->permissions ?? []) : []);

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'administrator',
                    'permissions' => $permissions,
                ],
            ],
        ]);
    }

    /**
     * Logout user & revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            AuditLogger::log('LOGOUT', 'AUTH', "Pengguna {$user->name} ({$user->email}) logout dari sistem.", 'User', $user->id);
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil',
        ]);
    }
}
