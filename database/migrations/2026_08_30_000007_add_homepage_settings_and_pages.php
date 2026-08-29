<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('masjid_infos', function (Blueprint $table) {
            $table->json('homepage_settings')->nullable()->after('qris_image');
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('masjid_id')->constrained('masjids')->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->longText('content')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['masjid_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');

        Schema::table('masjid_infos', function (Blueprint $table) {
            $table->dropColumn('homepage_settings');
        });
    }
};

