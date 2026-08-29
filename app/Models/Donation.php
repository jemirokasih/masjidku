<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'masjid_id',
        'title',
        'slug',
        'description',
        'target_amount',
        'current_amount',
        'bank_accounts',
        'qris_image',
        'is_active',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'bank_accounts' => 'array',
        'is_active' => 'boolean',
    ];

    public function masjid(): BelongsTo
    {
        return $this->belongsTo(Masjid::class);
    }
}

