<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'masjid_id',
        'user_id',
        'title',
        'slug',
        'category',
        'content',
        'speaker_name',
        'event_date',
        'image',
        'status',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];

    public function masjid(): BelongsTo
    {
        return $this->belongsTo(Masjid::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

