<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('masjid_id')->constrained('masjids')->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('target_amount', 15, 2)->default(0.00);
            $table->decimal('current_amount', 15, 2)->default(0.00);
            $table->json('bank_accounts')->nullable();
            $table->string('qris_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};

