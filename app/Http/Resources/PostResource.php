<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'masjid_id' => $this->masjid_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category,
            'content' => $this->content,
            'speaker_name' => $this->speaker_name,
            'event_date' => $this->event_date?->toIso8601String(),
            'image' => $this->image ? asset('storage/' . $this->image) : null,
            'status' => $this->status,
            'author_name' => $this->author?->name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

