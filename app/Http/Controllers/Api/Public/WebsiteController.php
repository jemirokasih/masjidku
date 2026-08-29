<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonationResource;
use App\Http\Resources\MasjidResource;
use App\Http\Resources\PostResource;
use App\Models\Masjid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebsiteController extends Controller
{
    /**
     * Get mosque public website complete payload (Info, Theme, Posts, Donations).
     */
    public function showWebsite(Request $request, string $identifier): JsonResponse
    {
        $masjid = Masjid::where('slug', $identifier)
            ->orWhere('custom_domain', $identifier)
            ->with(['activeTheme', 'info'])
            ->first();

        if (!$masjid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Website masjid tidak ditemukan.'
            ], 404);
        }

        if (!$masjid->isApproved()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Website masjid ini masih dalam proses verifikasi admin Masjidku.'
            ], 403);
        }

        $latestPosts = $masjid->posts()
            ->where('status', 'published')
            ->latest()
            ->take(6)
            ->get();

        $activeDonations = $masjid->donations()
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'masjid' => new MasjidResource($masjid),
                'theme' => $masjid->activeTheme ? [
                    'id' => $masjid->activeTheme->id,
                    'name' => $masjid->activeTheme->name,
                    'slug' => $masjid->activeTheme->slug,
                    'version' => $masjid->activeTheme->version,
                ] : null,
                'recent_posts' => PostResource::collection($latestPosts),
                'donations' => DonationResource::collection($activeDonations),
            ]
        ]);
    }

    /**
     * Get published posts / kajian updates for mosque.
     */
    public function getPosts(Request $request, string $identifier): JsonResponse
    {
        $masjid = Masjid::where('slug', $identifier)
            ->orWhere('custom_domain', $identifier)
            ->first();

        if (!$masjid || !$masjid->isApproved()) {
            return response()->json(['status' => 'error', 'message' => 'Website masjid tidak ditemukan atau belum diverifikasi.'], 404);
        }

        $category = $request->query('category');
        $query = $masjid->posts()->where('status', 'published');

        if ($category && in_array($category, ['berita', 'kajian', 'agenda'])) {
            $query->where('category', $category);
        }

        $posts = $query->latest()->paginate(12);

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
     * Get single post detail by slug.
     */
    public function getPostDetail(Request $request, string $identifier, string $postSlug): JsonResponse
    {
        $masjid = Masjid::where('slug', $identifier)
            ->orWhere('custom_domain', $identifier)
            ->first();

        if (!$masjid || !$masjid->isApproved()) {
            return response()->json(['status' => 'error', 'message' => 'Website masjid tidak ditemukan atau belum diverifikasi.'], 404);
        }

        $post = $masjid->posts()
            ->where('status', 'published')
            ->where('slug', $postSlug)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => new PostResource($post)
        ]);
    }

    /**
     * Get active donation campaigns for mosque.
     */
    public function getDonations(Request $request, string $identifier): JsonResponse
    {
        $masjid = Masjid::where('slug', $identifier)
            ->orWhere('custom_domain', $identifier)
            ->first();

        if (!$masjid || !$masjid->isApproved()) {
            return response()->json(['status' => 'error', 'message' => 'Website masjid tidak ditemukan atau belum diverifikasi.'], 404);
        }

        $donations = $masjid->donations()
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => DonationResource::collection($donations)
        ]);
    }
}

