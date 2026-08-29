<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('masjid_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('masjid_id')->constrained('masjids')->onDelete('cascade');
            $table->longText('description')->nullable();
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();
            $table->json('facilities')->nullable();
            $table->json('social_media')->nullable();
            $table->json('bank_accounts')->nullable();
            $table->string('qris_image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('masjid_infos');
    }
};

