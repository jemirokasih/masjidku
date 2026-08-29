<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThemeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'preview_image' => $this->preview_image ? asset('storage/' . $this->preview_image) : null,
            'is_free' => (bool) $this->is_free,
            'price' => (float) $this->price,
            'version' => $this->version,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

