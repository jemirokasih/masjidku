<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Theme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'preview_image',
        'is_free',
        'price',
        'version',
        'is_active',
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function masjids(): HasMany
    {
        return $this->hasMany(Masjid::class, 'active_theme_id');
    }
}

