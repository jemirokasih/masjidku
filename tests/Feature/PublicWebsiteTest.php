<?php

namespace Tests\Feature;

use App\Models\Masjid;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicWebsiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_cannot_access_unapproved_masjid_website(): void
    {
        $pengurus = User::factory()->create(['role' => 'pengurus_masjid']);
        $masjid = Masjid::create([
            'user_id' => $pengurus->id,
            'name' => 'Masjid Belum Diverifikasi',
            'slug' => 'belum-verifikasi',
            'verification_status' => 'pending',
        ]);

        $response = $this->getJson('/api/v1/public/masjid/belum-verifikasi');

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error');
    }

    public function test_public_can_access_approved_masjid_website_payload(): void
    {
        $pengurus = User::factory()->create(['role' => 'pengurus_masjid']);
        $theme = Theme::create(['name' => 'Free Theme', 'slug' => 'free-theme', 'is_free' => true]);

        $masjid = Masjid::create([
            'user_id' => $pengurus->id,
            'name' => 'Masjid Syuhada',
            'slug' => 'syuhada',
            'verification_status' => 'approved',
            'active_theme_id' => $theme->id,
        ]);
        $masjid->info()->create(['description' => 'Profil masjid syuhada']);

        $masjid->posts()->create([
            'user_id' => $pengurus->id,
            'title' => 'Pengumuman Sholat Jumat',
            'slug' => 'pengumuman-sholat-jumat',
            'category' => 'berita',
            'content' => 'Khotib Jumat pekan ini Ust. Fulan.',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/v1/public/masjid/syuhada');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.masjid.name', 'Masjid Syuhada')
            ->assertJsonPath('data.theme.slug', 'free-theme')
            ->assertJsonPath('data.recent_posts.0.title', 'Pengumuman Sholat Jumat');
    }
}

