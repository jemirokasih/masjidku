<?php

namespace App\Services\Registrars;

use App\Modules\Settings\Models\CompanySetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class RdashService
{
    public function domains(): array
    {
        $settings = CompanySetting::instance();
        if (!$settings->rdash_api_key || !$settings->rdash_api_secret) {
            throw new RuntimeException('Kredensial RDASH belum diisi.');
        }

        $url = rtrim($settings->rdash_base_url ?: 'https://api.rdash.id/v1', '/');
        $page = 1;
        $domains = [];

        do {
            $response = Http::acceptJson()
                ->timeout(20)
                ->withBasicAuth($settings->rdash_api_key, $settings->rdash_api_secret)
                ->get("{$url}/domains", ['page' => $page, 'limit' => 100]);

            if ($response->failed()) {
                $json = $response->json();
                $msg = $json['message'] ?? $response->body() ?: 'Gagal terhubung ke API RDASH.';
                throw new RuntimeException("RDASH Error ({$response->status()}): {$msg}");
            }

            $data = $response->json();
            $items = $data['data'] ?? [];
            foreach ($items as $item) {
                $mapped = $this->map($item);
                if (!empty($mapped['domain_name'])) {
                    $domains[] = $mapped;
                }
            }
            $page++;
            $lastPage = data_get($data, 'meta.last_page', 1);
        } while ($page <= $lastPage);

        return $domains;
    }

    private function map(array $item): array
    {
        $nameservers = collect(range(1, 5))->map(fn ($i) => $item["nameserver_{$i}"] ?? null)->filter()->values()->all();
        $status = match ((int) ($item['status'] ?? 0)) {
            1 => 'active', 2 => 'expired', 5, 6 => 'transferred', 7 => 'suspended', default => 'pending',
        };
        return [
            'domain_name' => strtolower($item['name'] ?? $item['domain'] ?? ''),
            'provider' => 'rdash',
            'external_domain_id' => (string) ($item['id'] ?? ''),
            'registrar_name' => 'RDASH',
            'registration_date' => $this->parseDate($item['created_at'] ?? $item['created'] ?? null),
            'expiration_date' => $this->parseDate($item['expired_at'] ?? $item['expires_at'] ?? null),
            'status' => $status,
            'nameservers' => $nameservers,
            'notes' => $item['notes'] ?? null,
        ];
    }

    private function parseDate(?string $value): ?string
    {
        if (!$value) return null;
        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable $e) {
            return null;
        }
    }
}
