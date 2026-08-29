<?php

namespace Tests\Feature;

use App\Models\Masjid;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantContentAndThemeTest extends TestCase
{
    use RefreshDatabase;

    public function test_pengurus_can_manage_posts_donations_and_select_theme(): void
    {
        $pengurus = User::factory()->create(['role' => 'pengurus_masjid']);
        $masjid = Masjid::create([
            'user_id' => $pengurus->id,
            'name' => 'Masjid Nurul Huda',
            'slug' => 'nurulhuda',
            'verification_status' => 'approved',
        ]);
        $masjid->info()->create([]);

        $theme = Theme::create([
            'name' => 'Theme Hijau',
            'slug' => 'theme-hijau',
            'is_free' => true,
        ]);

        // 1. Create Post
        $postResponse = $this->actingAs($pengurus)
            ->postJson('/api/v1/tenant/posts', [
                'title' => 'Kajian Fiqih Muamalah',
                'category' => 'kajian',
                'content' => 'Membahas bab rukun dan syarat jual beli.',
                'speaker_name' => 'Ust. Dr. Fulan',
            ]);

        $postResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Kajian Fiqih Muamalah');

        // 2. Create Donation Campaign
        $donationResponse = $this->actingAs($pengurus)
            ->postJson('/api/v1/tenant/donations', [
                'title' => 'Infaq Karpet Masjid',
                'description' => 'Pengadaan karpet empuk untuk ruang sholat utama.',
                'target_amount' => 10000000,
            ]);

        $donationResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Infaq Karpet Masjid');

        // 3. Select Theme
        $themeResponse = $this->actingAs($pengurus)
            ->postJson('/api/v1/tenant/themes/select', [
                'theme_id' => $theme->id,
            ]);

        $themeResponse->assertStatus(200)
            ->assertJsonPath('data.slug', 'theme-hijau');

        $this->assertDatabaseHas('masjids', [
            'id' => $masjid->id,
            'active_theme_id' => $theme->id,
        ]);
    }
}

