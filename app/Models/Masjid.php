<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Masjid extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'custom_domain',
        'address',
        'city',
        'province',
        'postal_code',
        'latitude',
        'longitude',
        'phone',
        'email',
        'verification_status',
        'verification_document',
        'verification_note',
        'active_theme_id',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activeTheme(): BelongsTo
    {
        return $this->belongsTo(Theme::class, 'active_theme_id');
    }

    public function info(): HasOne
    {
        return $this->hasOne(MasjidInfo::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }
}

