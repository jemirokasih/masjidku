<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ThemeResource;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ThemeMarketplaceController extends Controller
{
    /**
     * List all marketplace themes (Admin view).
     */
    public function index(Request $request): JsonResponse
    {
        $themes = Theme::latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => ThemeResource::collection($themes)
        ]);
    }

    /**
     * Store a new theme in the marketplace.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|alpha_dash|unique:themes,slug',
            'description' => 'nullable|string',
            'preview_image' => 'nullable|file|image|max:2048',
            'is_free' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'version' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('preview_image')) {
            $imagePath = $request->file('preview_image')->store('themes_previews', 'public');
        }

        $theme = Theme::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug']),
            'description' => $validated['description'] ?? null,
            'preview_image' => $imagePath,
            'is_free' => $validated['is_free'] ?? true,
            'price' => $validated['price'] ?? 0,
            'version' => $validated['version'] ?? '1.0.0',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tema baru berhasil ditambahkan ke marketplace.',
            'data' => new ThemeResource($theme)
        ], 201);
    }

    /**
     * Show single theme details.
     */
    public function show(int $id): JsonResponse
    {
        $theme = Theme::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => new ThemeResource($theme)
        ]);
    }

    /**
     * Update an existing theme.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $theme = Theme::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:100|alpha_dash|unique:themes,slug,' . $theme->id,
            'description' => 'nullable|string',
            'preview_image' => 'nullable|file|image|max:2048',
            'is_free' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'version' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('preview_image')) {
            $validated['preview_image'] = $request->file('preview_image')->store('themes_previews', 'public');
        }

        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $theme->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data tema berhasil diperbarui.',
            'data' => new ThemeResource($theme)
        ]);
    }

    /**
     * Delete a theme.
     */
    public function destroy(int $id): JsonResponse
    {
        $theme = Theme::findOrFail($id);
        $theme->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tema berhasil dihapus dari marketplace.'
        ]);
    }
}

