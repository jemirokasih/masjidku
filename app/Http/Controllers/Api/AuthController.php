<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MasjidResource;
use App\Models\Masjid;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new Mosque Admin (Simplified: Name, Email, Phone).
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'nullable|string|min:6',
            'masjid_name' => 'nullable|string|max:255',
            'masjid_slug' => 'nullable|string|max:100|alpha_dash|unique:masjids,slug',
        ]);

        $rawPassword = $validated['password'] ?? 'password123';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($rawPassword),
            'role' => 'pengurus_masjid',
            'phone' => $validated['phone'],
        ]);

        // Get default theme
        $defaultTheme = Theme::where('slug', 'default-clean')->first() ?? Theme::where('is_free', true)->first();

        $masjidName = $validated['masjid_name'] ?? ('Masjid ' . $validated['name']);
        $baseSlug = $validated['masjid_slug'] ?? Str::slug($masjidName);
        if (!$baseSlug || Masjid::where('slug', $baseSlug)->exists()) {
            $baseSlug = Str::slug($masjidName) . '-' . Str::random(4);
        }

        $masjid = Masjid::create([
            'user_id' => $user->id,
            'name' => $masjidName,
            'slug' => $baseSlug,
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'verification_status' => 'pending',
            'active_theme_id' => $defaultTheme?->id,
        ]);

        // Create default masjid info
        $masjid->info()->create([
            'description' => 'Selamat datang di official website ' . $masjid->name,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi berhasil! Akun Anda telah aktif dan dapat langsung digunakan.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ],
                'masjid' => new MasjidResource($masjid->load(['info', 'activeTheme'])),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
    }

    /**
     * Authenticate user and issue access token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak cocok dengan catatan kami.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load('masjid.info', 'masjid.activeTheme');

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ],
                'masjid' => $user->masjid ? new MasjidResource($user->masjid) : null,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ]);
    }

    /**
     * Get authenticated user profile & masjid details.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('masjid.info', 'masjid.activeTheme');

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                ],
                'masjid' => $user->masjid ? new MasjidResource($user->masjid) : null,
            ]
        ]);
    }

    /**
     * Revoke current user token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil. Token telah dicabut.'
        ]);
    }
}
