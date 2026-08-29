<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('masjid_id')->constrained('masjids')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->enum('category', ['berita', 'kajian', 'agenda'])->default('berita');
            $table->longText('content');
            $table->string('speaker_name')->nullable(); // for kajian / ustadz
            $table->dateTime('event_date')->nullable();
            $table->string('image')->nullable();
            $table->enum('status', ['draft', 'published'])->default('published');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};

