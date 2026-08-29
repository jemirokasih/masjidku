<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasjidkuAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_pengurus_masjid_can_register_with_masjid_details(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Pengurus Masjid Taqwa',
            'email' => 'taqwa@masjid.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '08123456789',
            'masjid_name' => 'Masjid At-Taqwa',
            'masjid_slug' => 'attaqwa',
            'address' => 'Jl. Kebon Jeruk No. 10',
            'city' => 'Jakarta Barat',
            'province' => 'DKI Jakarta',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'masjid' => ['id', 'name', 'slug', 'verification_status'],
                    'access_token',
                    'token_type',
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'taqwa@masjid.id',
            'role' => 'pengurus_masjid',
        ]);

        $this->assertDatabaseHas('masjids', [
            'slug' => 'attaqwa',
            'verification_status' => 'pending',
        ]);
    }

    public function test_user_can_login_and_get_me_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@masjidku.com',
            'password' => bcrypt('password123'),
            'role' => 'platform_admin',
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@masjidku.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $token = $loginResponse->json('data.access_token');

        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.user.email', 'admin@masjidku.com')
            ->assertJsonPath('data.user.role', 'platform_admin');
    }
}

