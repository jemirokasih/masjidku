<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MasjidResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'domain_url' => url('/m/' . $this->slug),
            'custom_domain' => $this->custom_domain,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'phone' => $this->phone,
            'email' => $this->email,
            'verification_status' => $this->verification_status,
            'verification_document' => $this->verification_document ? asset('storage/' . $this->verification_document) : null,
            'verification_note' => $this->verification_note,
            'active_theme' => new ThemeResource($this->whenLoaded('activeTheme')),
            'info' => $this->whenLoaded('info', function() {
                return [
                    'description' => $this->info->description,
                    'vision' => $this->info->vision,
                    'mission' => $this->info->mission,
                    'facilities' => $this->info->facilities ?? [],
                    'social_media' => $this->info->social_media ?? [],
                    'bank_accounts' => $this->info->bank_accounts ?? [],
                    'qris_image' => $this->info->qris_image ? asset('storage/' . $this->info->qris_image) : null,
                ];
            }),
            'pengurus' => $this->whenLoaded('user', function() {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

