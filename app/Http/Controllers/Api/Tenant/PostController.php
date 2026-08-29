<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * List posts (News, Kajian updates, Agendas) for the mosque.
     */
    public function index(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Data masjid tidak ditemukan.'], 404);
        }

        $category = $request->query('category');
        $query = $masjid->posts();

        if ($category && in_array($category, ['berita', 'kajian', 'agenda'])) {
            $query->where('category', $category);
        }

        $posts = $query->latest()->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => PostResource::collection($posts),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    /**
     * Store a new post / kajian update.
     */
    public function store(Request $request): JsonResponse
    {
        $masjid = $request->user()->masjid;

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Data masjid tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:berita,kajian,agenda',
            'content' => 'required|string',
            'speaker_name' => 'nullable|string|max:255',
            'event_date' => 'nullable|date',
            'image' => 'nullable|file|image|max:3072',
            'status' => 'nullable|in:draft,published',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = $masjid->posts()->create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'category' => $validated['category'],
            'content' => $validated['content'],
            'speaker_name' => $validated['speaker_name'] ?? null,
            'event_date' => $validated['event_date'] ?? null,
            'image' => $imagePath,
            'status' => $validated['status'] ?? 'published',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Konten / update kajian berhasil ditambahkan.',
            'data' => new PostResource($post)
        ], 201);
    }

    /**
     * Show single post detail.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $post = $masjid->posts()->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => new PostResource($post)
        ]);
    }

    /**
     * Update post / kajian update.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $post = $masjid->posts()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|in:berita,kajian,agenda',
            'content' => 'sometimes|required|string',
            'speaker_name' => 'nullable|string|max:255',
            'event_date' => 'nullable|date',
            'image' => 'nullable|file|image|max:3072',
            'status' => 'nullable|in:draft,published',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('posts', 'public');
        }

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        $post->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Konten berhasil diperbarui.',
            'data' => new PostResource($post)
        ]);
    }

    /**
     * Delete post.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $masjid = $request->user()->masjid;
        $post = $masjid->posts()->findOrFail($id);

        $post->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Konten berhasil dihapus.'
        ]);
    }
}

