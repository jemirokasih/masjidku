<?php

namespace Tests\Feature;

use App\Models\Masjid;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_admin_can_list_and_verify_pending_masjids(): void
    {
        $admin = User::factory()->create(['role' => 'platform_admin']);

        $pengurus = User::factory()->create(['role' => 'pengurus_masjid']);
        $masjid = Masjid::create([
            'user_id' => $pengurus->id,
            'name' => 'Masjid Al-Barkah',
            'slug' => 'albarkah',
            'verification_status' => 'pending',
        ]);

        // List pending masjids
        $response = $this->actingAs($admin)
            ->getJson('/api/v1/admin/masjids?status=pending');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.slug', 'albarkah')
            ->assertJsonPath('data.0.verification_status', 'pending');

        // Verify and Approve
        $verifyResponse = $this->actingAs($admin)
            ->postJson("/api/v1/admin/masjids/{$masjid->id}/verify", [
                'status' => 'approved',
                'note' => 'Dokumen lengkap dan valid.',
            ]);

        $verifyResponse->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'approved');

        $this->assertDatabaseHas('masjids', [
            'id' => $masjid->id,
            'verification_status' => 'approved',
        ]);
    }
}

