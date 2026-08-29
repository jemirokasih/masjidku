<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MasjidResource;
use App\Models\Masjid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasjidVerificationController extends Controller
{
    /**
     * List registered mosques for verification.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = Masjid::with(['user', 'info', 'activeTheme']);

        if ($status && in_array($status, ['pending', 'approved', 'rejected'])) {
            $query->where('verification_status', $status);
        }

        $masjids = $query->latest()->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => MasjidResource::collection($masjids),
            'meta' => [
                'current_page' => $masjids->currentPage(),
                'last_page' => $masjids->lastPage(),
                'per_page' => $masjids->perPage(),
                'total' => $masjids->total(),
            ]
        ]);
    }

    /**
     * View specific mosque verification details.
     */
    public function show(int $id): JsonResponse
    {
        $masjid = Masjid::with(['user', 'info', 'activeTheme'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => new MasjidResource($masjid)
        ]);
    }

    /**
     * Verify (Approve or Reject) a mosque registration request.
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'note' => 'nullable|string|max:1000',
        ]);

        $masjid = Masjid::findOrFail($id);

        $masjid->update([
            'verification_status' => $validated['status'],
            'verification_note' => $validated['note'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status verifikasi masjid berhasil diperbarui menjadi ' . strtoupper($validated['status']),
            'data' => new MasjidResource($masjid->fresh(['user', 'info', 'activeTheme']))
        ]);
    }
}

