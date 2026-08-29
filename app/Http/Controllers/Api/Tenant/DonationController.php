<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    /**
     * List infaq & donation programs for mosque.
     */
    public function index(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Data masjid tidak ditemukan.'], 404);
        }

        $donations = $masjid->donations()->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => DonationResource::collection($donations)
        ]);
    }

    /**
     * Store new donation campaign.
     */
    public function store(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Data masjid tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'nullable|numeric|min:0',
            'bank_accounts' => 'nullable|array',
            'qris_image' => 'nullable|file|image|max:2048',
            'is_active' => 'boolean',
        ]);

        $qrisPath = null;
        if ($request->hasFile('qris_image')) {
            $qrisPath = $request->file('qris_image')->store('donations_qris', 'public');
        }

        $donation = $masjid->donations()->create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'description' => $validated['description'] ?? null,
            'target_amount' => $validated['target_amount'] ?? 0,
            'current_amount' => 0,
            'bank_accounts' => $validated['bank_accounts'] ?? [],
            'qris_image' => $qrisPath,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Program donasi / infaq berhasil dibuat.',
            'data' => new DonationResource($donation)
        ], 201);
    }

    /**
     * Show donation detail.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $donation = $masjid->donations()->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => new DonationResource($donation)
        ]);
    }

    /**
     * Update donation campaign.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $donation = $masjid->donations()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'nullable|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'bank_accounts' => 'nullable|array',
            'qris_image' => 'nullable|file|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('qris_image')) {
            $validated['qris_image'] = $request->file('qris_image')->store('donations_qris', 'public');
        }

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        $donation->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Program donasi berhasil diperbarui.',
            'data' => new DonationResource($donation)
        ]);
    }

    /**
     * Delete donation campaign.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $donation = $masjid->donations()->findOrFail($id);

        $donation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Program donasi berhasil dihapus.'
        ]);
    }
}

