<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MasjidInfo extends Model
{
    use HasFactory;

    protected $fillable = [
        'masjid_id',
        'description',
        'vision',
        'mission',
        'facilities',
        'social_media',
        'bank_accounts',
        'qris_image',
    ];

    protected $casts = [
        'facilities' => 'array',
        'social_media' => 'array',
        'bank_accounts' => 'array',
    ];

    public function masjid(): BelongsTo
    {
        return $this->belongsTo(Masjid::class);
    }
}

