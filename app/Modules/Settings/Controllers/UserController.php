<?php

namespace App\Modules\Settings\Controllers;

use App\Helpers\AuditLogger;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all system users
     */
    public function index(): JsonResponse
    {
        $users = User::orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    /**
     * Create user
     */
    public function store(Request $request): JsonResponse
    {
        $validRoles = array_merge(
            ['superadmin', 'administrator', 'admin', 'finance', 'hr', 'project_manager', 'staff', 'client'],
            Role::pluck('name')->toArray()
        );

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in($validRoles)],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        AuditLogger::log(
            'CREATE',
            'USERS',
            "Menambahkan pengguna baru: {$user->name} ({$user->email}) dengan peranan " . strtoupper($user->role) . ".",
            'User',
            $user->id,
            null,
            $user->only(['id', 'name', 'email', 'role', 'phone', 'is_active'])
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna baru berhasil ditambahkan.',
            'data' => $user,
        ], 201);
    }

    /**
     * Update user
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validRoles = array_merge(
            ['superadmin', 'administrator', 'admin', 'finance', 'hr', 'project_manager', 'staff', 'client'],
            Role::pluck('name')->toArray()
        );

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in($validRoles)],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $oldValues = $user->only(['name', 'email', 'role', 'phone', 'is_active']);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        AuditLogger::log(
            'UPDATE',
            'USERS',
            "Memperbarui profil data akun pengguna {$user->name} ({$user->email}).",
            'User',
            $user->id,
            $oldValues,
            $user->only(['name', 'email', 'role', 'phone', 'is_active'])
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil diperbarui.',
            'data' => $user,
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting the current user
        if ($user->id === auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.',
            ], 422);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $oldValues = $user->only(['id', 'name', 'email', 'role', 'phone', 'is_active']);

        $user->delete();

        AuditLogger::log(
            'DELETE',
            'USERS',
            "Menghapus akun pengguna {$userName} ({$userEmail}).",
            'User',
            $id,
            $oldValues,
            null
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }
}
