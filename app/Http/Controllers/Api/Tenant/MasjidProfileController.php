<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\MasjidResource;
use App\Models\Masjid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MasjidProfileController extends Controller
{
    /**
     * Get authenticated mosque admin profile & mosque info.
     */
    public function show(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda belum terhubung dengan data masjid.'
            ], 404);
        }

        $masjid->load(['user', 'info', 'activeTheme']);

        return response()->json([
            'status' => 'success',
            'data' => new MasjidResource($masjid)
        ]);
    }

    /**
     * Update basic mosque details (name, slug, location, contact, verification document).
     */
    public function update(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data masjid tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:100|alpha_dash|unique:masjids,slug,' . $masjid->id,
            'custom_domain' => 'nullable|string|max:255|unique:masjids,custom_domain,' . $masjid->id,
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'verification_document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        if ($request->hasFile('verification_document')) {
            $validated['verification_document'] = $request->file('verification_document')->store('verification_docs', 'public');
            // Re-submit for pending verification if new document is uploaded
            $validated['verification_status'] = 'pending';
        }

        $masjid->update($validated);

        if (isset($validated['name']) && $masjid->info) {
            if (!$masjid->info->description || str_contains($masjid->info->description, 'Selamat datang di official website')) {
                $masjid->info->update([
                    'description' => 'Selamat datang di official website ' . $masjid->name,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profil masjid berhasil diperbarui.',
            'data' => new MasjidResource($masjid->fresh(['user', 'info', 'activeTheme']))
        ]);
    }

    /**
     * Update detailed mosque info (vision, mission, facilities, social media, bank info, QRIS).
     */
    public function updateInfo(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data masjid tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'description' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'facilities' => 'nullable|array',
            'social_media' => 'nullable|array',
            'bank_accounts' => 'nullable|array',
            'homepage_settings' => 'nullable|array',
            'qris_image' => 'nullable|file|image|max:2048',
        ]);

        $qrisPath = null;
        if ($request->hasFile('qris_image')) {
            $qrisPath = $request->file('qris_image')->store('qris', 'public');
        }

        $info = $masjid->info ?? $masjid->info()->create([]);

        $dataToUpdate = [
            'description' => $validated['description'] ?? $info->description,
            'vision' => $validated['vision'] ?? $info->vision,
            'mission' => $validated['mission'] ?? $info->mission,
            'facilities' => $validated['facilities'] ?? $info->facilities,
            'social_media' => $validated['social_media'] ?? $info->social_media,
            'bank_accounts' => $validated['bank_accounts'] ?? $info->bank_accounts,
            'homepage_settings' => $validated['homepage_settings'] ?? $info->homepage_settings,
        ];

        if ($qrisPath) {
            $dataToUpdate['qris_image'] = $qrisPath;
        }

        $info->update($dataToUpdate);

        return response()->json([
            'status' => 'success',
            'message' => 'Informasi detail masjid berhasil diperbarui.',
            'data' => new MasjidResource($masjid->fresh(['user', 'info', 'activeTheme']))
        ]);
    }
}

