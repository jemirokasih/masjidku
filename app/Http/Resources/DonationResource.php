<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'masjid_id' => $this->masjid_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'target_amount' => (float) $this->target_amount,
            'current_amount' => (float) $this->current_amount,
            'bank_accounts' => $this->bank_accounts ?? [],
            'qris_image' => $this->qris_image ? asset('storage/' . $this->qris_image) : null,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

