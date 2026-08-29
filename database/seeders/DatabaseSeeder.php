<?php

namespace Database\Seeders;

use App\Models\Donation;
use App\Models\Masjid;
use App\Models\Post;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Platform Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@masjidku.com'],
            [
                'name' => 'Super Admin Masjidku',
                'password' => Hash::make('password123'),
                'role' => 'platform_admin',
                'phone' => '081234567890',
            ]
        );

        // 2. Seed Marketplace Themes
        $themeClean = Theme::firstOrCreate(
            ['slug' => 'default-clean'],
            [
                'name' => 'Default Clean',
                'description' => 'Tema bawaan yang bersih, responsif, dan mudah dibaca.',
                'is_free' => true,
                'price' => 0,
                'version' => '1.0.0',
                'is_active' => true,
            ]
        );

        $themeGreen = Theme::firstOrCreate(
            ['slug' => 'green-islamic'],
            [
                'name' => 'Green Islamic Modern',
                'description' => 'Tema bernuansa hijau islami modern dengan layout jadwal sholat dan banner kajian menarik.',
                'is_free' => true,
                'price' => 0,
                'version' => '1.1.0',
                'is_active' => true,
            ]
        );

        $themeGold = Theme::firstOrCreate(
            ['slug' => 'gold-premium'],
            [
                'name' => 'Gold Premium Elegant',
                'description' => 'Tema premium bernuansa emas elegan lengkap dengan integrasi live streaming kajian & widget donasi interaktif.',
                'is_free' => false,
                'price' => 150000,
                'version' => '2.0.0',
                'is_active' => true,
            ]
        );

        // 3. Seed Sample Mosque Admin & Approved Mosque
        $pengurus = User::firstOrCreate(
            ['email' => 'pengurus@alikhlas.id'],
            [
                'name' => 'Ust. Ahmad Dahlan',
                'password' => Hash::make('password123'),
                'role' => 'pengurus_masjid',
                'phone' => '089876543210',
            ]
        );

        $masjid = Masjid::firstOrCreate(
            ['slug' => 'alikhlas'],
            [
                'user_id' => $pengurus->id,
                'name' => 'Masjid Agung Al-Ikhlas',
                'custom_domain' => null,
                'address' => 'Jl. Merdeka No. 45, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'postal_code' => '12110',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'phone' => '021-5551234',
                'email' => 'info@alikhlas.id',
                'verification_status' => 'approved',
                'verification_note' => 'Disetujui oleh admin Masjidku.',
                'active_theme_id' => $themeGreen->id,
            ]
        );

        // Create Mosque Detail Info
        $masjid->info()->updateOrCreate([], [
            'description' => 'Masjid Agung Al-Ikhlas adalah pusat kegiatan ibadah dan dakwah masyarakat Jakarta Selatan.',
            'vision' => 'Menjadi pusat peradaban dan pembinaan ummat yang unggul dan ramah jamaah.',
            'mission' => 'Menyelenggarakan ibadah yang nyaman, pendidikan Al-Qur\'an, serta pemberdayaan ekonomi syariah.',
            'facilities' => ['AC Central', 'Area Parkir Luas', 'Perpustakaan Islami', 'Ruang Wudhu Suci', 'WiFi Gratis'],
            'social_media' => [
                'instagram' => '@alikhlas_official',
                'youtube' => 'AlIkhlas TV',
            ],
            'bank_accounts' => [
                [
                    'bank' => 'Bank Syariah Indonesia (BSI)',
                    'account_number' => '7123456789',
                    'account_name' => 'Yayasan Masjid Al-Ikhlas',
                ]
            ],
        ]);

        // Create Sample Posts & Kajian
        Post::firstOrCreate(
            ['slug' => 'kajian-rutin-subah-tafsir-al-quran'],
            [
                'masjid_id' => $masjid->id,
                'user_id' => $pengurus->id,
                'title' => 'Kajian Rutin Subuh: Tafsir Al-Qur\'an Surah Al-Kahfi',
                'category' => 'kajian',
                'content' => 'Hadirilah kajian rutin subuh setiap hari Sabtu bersama Ust. Dr. H. Abdul Somad, Lc., MA. Membahas kandungan hikmah Surah Al-Kahfi.',
                'speaker_name' => 'Ust. Dr. H. Abdul Somad, Lc., MA',
                'event_date' => now()->addDays(2),
                'status' => 'published',
            ]
        );

        Post::firstOrCreate(
            ['slug' => 'gotong-royong-bersih-masjid-menyambut-ramadhan'],
            [
                'masjid_id' => $masjid->id,
                'user_id' => $pengurus->id,
                'title' => 'Gotong Royong Bersih Masjid Menyambut Bulan Suci Ramadhan',
                'category' => 'agenda',
                'content' => 'Undangan kepada segenap jamaah untuk berpartisipasi dalam agenda kerja bakti pembersihan area utama masjid dan tempat wudhu.',
                'event_date' => now()->addDays(5),
                'status' => 'published',
            ]
        );

        // Create Sample Donation Campaign
        Donation::firstOrCreate(
            ['slug' => 'renovasi-sound-system-masjid'],
            [
                'masjid_id' => $masjid->id,
                'title' => 'Infaq Renovasi & Upgrading Sound System Masjid',
                'description' => 'Program penggalangan dana infaq untuk pembaruan perangkat tata suara area sholat utama agar khutbah & pengajian terdengar lebih jernih.',
                'target_amount' => 25000000.00,
                'current_amount' => 12500000.00,
                'bank_accounts' => [
                    [
                        'bank' => 'Bank Syariah Indonesia (BSI)',
                        'account_number' => '7123456789',
                        'account_name' => 'Infaq Renovasi Masjid Al-Ikhlas',
                    ]
                ],
                'is_active' => true,
            ]
        );
    }
}
