<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\ThemeResource;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    /**
     * List available themes from Marketplace for Mosque Admin.
     */
    public function index(Request $request): JsonResponse
    {
        $themes = Theme::where('is_active', true)->get();
        $activeThemeId = $request->user()->masjid?->active_theme_id;

        return response()->json([
            'status' => 'success',
            'data' => ThemeResource::collection($themes),
            'active_theme_id' => $activeThemeId,
        ]);
    }

    /**
     * Select / change active website template.
     */
    public function select(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme_id' => 'required|exists:themes,id',
        ]);

        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Data masjid tidak ditemukan.'], 404);
        }

        $theme = Theme::where('is_active', true)->findOrFail($validated['theme_id']);

        $masjid->update([
            'active_theme_id' => $theme->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Template website berhasil diubah ke ' . $theme->name,
            'data' => new ThemeResource($theme),
        ]);
    }
}

