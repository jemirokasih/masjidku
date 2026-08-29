<?php

namespace App\Services\Registrars;

use App\Modules\Settings\Models\CompanySetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SrsxService
{
    public function domains(): array
    {
        $settings = CompanySetting::instance();
        if (!$settings->srsx_user_id || !$settings->srsx_api_key) {
            throw new RuntimeException('Kredensial SRS-X belum diisi.');
        }

        $baseUrl = rtrim($settings->srsx_base_url ?: 'https://srsx.rumahweb.com/api', '/');
        $response = Http::asForm()->timeout(30)->post("{$baseUrl}/domain/list", $this->credentials($settings));
        if ($response->failed()) {
            throw new RuntimeException("SRS-X HTTP Error ({$response->status()}): " . $response->body());
        }

        $body = $response->body();
        $xml = @simplexml_load_string($body);
        if (!$xml || (string) ($xml->result->resultCode ?? '') !== '1000') {
            $msg = (string) ($xml?->result?->resultMsg ?? 'SRS-X menolak kredensial atau URL API.');
            throw new RuntimeException("SRS-X API Error: {$msg}");
        }

        $children = $xml->result->resultData?->children();
        if (!$children || count($children) === 0) {
            return [];
        }

        return collect($children)
            ->map(function ($item) use ($settings) {
                $domain = strtolower(trim((string) ($item->domain ?? $item->name ?? $item->domain_name ?? '')));
                $apiId = trim((string) ($item->api_id ?? $item->apiid ?? $item->domainid ?? $item->id ?? ''));
                if (!$domain) return null;

                $startDate = (string) ($item->startdate ?? $item->created_at ?? $item->registration_date ?? '');
                $endDate = (string) ($item->enddate ?? $item->expired_at ?? $item->expiration_date ?? '');
                $statusRaw = strtolower((string) ($item->status ?? 'active'));
                $status = in_array($statusRaw, ['active', '1', 'ok'], true) ? 'active' : 'pending';

                $nameservers = collect(['ns1', 'ns2', 'ns3', 'ns4', 'ns5'])
                    ->map(fn ($key) => trim((string) ($item->{$key} ?? '')))
                    ->filter()
                    ->values()
                    ->all();

                if ($startDate || $endDate || !empty($nameservers)) {
                    return [
                        'domain_name' => $domain,
                        'provider' => 'srsx',
                        'external_domain_id' => $apiId ?: $domain,
                        'registrar_name' => 'SRS-X',
                        'registration_date' => $this->parseDate($startDate),
                        'expiration_date' => $this->parseDate($endDate),
                        'status' => $status,
                        'nameservers' => $nameservers,
                    ];
                }

                if ($apiId) {
                    try {
                        return $this->detail($domain, $apiId, $settings);
                    } catch (\Throwable $e) {
                        return [
                            'domain_name' => $domain,
                            'provider' => 'srsx',
                            'external_domain_id' => $apiId,
                            'registrar_name' => 'SRS-X',
                            'registration_date' => null,
                            'expiration_date' => null,
                            'status' => 'active',
                            'nameservers' => [],
                        ];
                    }
                }

                return [
                    'domain_name' => $domain,
                    'provider' => 'srsx',
                    'external_domain_id' => $domain,
                    'registrar_name' => 'SRS-X',
                    'registration_date' => null,
                    'expiration_date' => null,
                    'status' => 'active',
                    'nameservers' => [],
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function detail(string $domain, string $apiId, CompanySetting $settings): array
    {
        $url = rtrim($settings->srsx_base_url ?: 'https://srsx.rumahweb.com/api', '/') . '/domain/info';
        $body = Http::asForm()->timeout(15)->post($url, $this->credentials($settings) + ['domain' => $domain, 'api_id' => $apiId])->throw()->body();
        $xml = @simplexml_load_string($body);
        if (!$xml || (string) ($xml->result->resultCode ?? '') !== '1000') {
            throw new RuntimeException('SRS-X gagal mengambil detail ' . $domain . '.');
        }
        $data = $xml->result->resultData;
        $nameservers = collect(['ns1', 'ns2', 'ns3', 'ns4'])->map(fn ($key) => trim((string) ($data->{$key} ?? '')))->filter()->values()->all();
        return [
            'domain_name' => strtolower((string) ($data->domain ?? $domain)),
            'provider' => 'srsx',
            'external_domain_id' => (string) ($data->api_id ?? $apiId),
            'registrar_name' => 'SRS-X',
            'registration_date' => $this->parseDate((string) ($data->startdate ?? null)),
            'expiration_date' => $this->parseDate((string) ($data->enddate ?? null)),
            'status' => in_array(strtolower((string) ($data->status ?? '')), ['active', '1', 'ok'], true) ? 'active' : 'pending',
            'nameservers' => $nameservers,
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

    private function credentials(CompanySetting $settings): array
    {
        return ['username' => $settings->srsx_user_id, 'password' => hash('sha256', $settings->srsx_api_key)];
    }
}
