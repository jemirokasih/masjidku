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
     * Supports preview mode for mosque owners or preview parameter.
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

        $isPreviewMode = $request->query('preview') == 'true' || $request->query('preview') == '1';

        if (!$masjid->isApproved() && !$isPreviewMode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Website masjid ini masih dalam proses verifikasi admin Masjidku.',
                'verification_status' => $masjid->verification_status,
                'preview_available' => true,
            ], 403);
        }

        $latestPosts = $masjid->posts()
            ->latest()
            ->take(6)
            ->get();

        $activeDonations = $masjid->donations()
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
                'is_preview' => !$masjid->isApproved(),
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

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Website masjid tidak ditemukan.'], 404);
        }

        $category = $request->query('category');
        $query = $masjid->posts();

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

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Website masjid tidak ditemukan.'], 404);
        }

        $post = $masjid->posts()
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

        if (!$masjid) {
            return response()->json(['status' => 'error', 'message' => 'Website masjid tidak ditemukan.'], 404);
        }

        $donations = $masjid->donations()
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => DonationResource::collection($donations)
        ]);
    }
}
