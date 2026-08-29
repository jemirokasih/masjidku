<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;
        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Masjid tidak ditemukan.'], 404);
        }

        $pages = $masjid->pages()->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;
        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Masjid tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);

        $page = $masjid->pages()->create([
            'title' => $validated['title'],
            'slug' => $slug,
            'content' => $validated['content'] ?? '',
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Halaman statis berhasil dibuat.',
            'data' => $page
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $page = $masjid->pages()->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $page
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $page = $masjid->pages()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        if (isset($validated['title']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        } elseif (!empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $page->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Halaman statis berhasil diperbarui.',
            'data' => $page
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $page = $masjid->pages()->findOrFail($id);

        $page->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Halaman statis berhasil dihapus.'
        ]);
    }
}

