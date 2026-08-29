<?php

namespace App\Services;

use App\Modules\Domains\Models\Domain;
use App\Services\Registrars\RdashService;
use App\Services\Registrars\SrsxService;

class DomainSyncService
{
    public function __construct(private RdashService $rdash, private SrsxService $srsx) {}

    public function sync(array $providers): array
    {
        $result = ['synced' => 0, 'providers' => [], 'errors' => []];
        foreach ($providers as $provider) {
            try {
                $items = $provider === 'rdash' ? $this->rdash->domains() : $this->srsx->domains();
                $result['providers'][] = $provider;
            } catch (\Throwable $e) {
                // Provider-level failure (missing credentials / network / auth) -> keep going.
                $result['errors'][$provider] = $e->getMessage();
                continue;
            }

            foreach ($items as $item) {
                try {
                    $domain = Domain::withTrashed()->firstOrNew(['domain_name' => $item['domain_name']]);

                    // Handling transfer conflict between registrars:
                    // Do not overwrite an existing ACTIVE domain from another provider with a TRANSFERRED/EXPIRED record.
                    if ($domain->exists && $domain->status === 'active' && $item['status'] !== 'active' && $domain->provider !== $item['provider']) {
                        continue;
                    }

                    $domain->fill($item + ['last_synced_at' => now()]);
                    if ($domain->trashed()) $domain->restore();
                    $domain->save();
                    $result['synced']++;
                } catch (\Throwable $e) {
                    // One bad domain must not abort the whole provider batch.
                    $msg = ($item['domain_name'] ?? 'unknown') . ': ' . $e->getMessage();
                    $result['errors'][$provider] = isset($result['errors'][$provider])
                        ? $result['errors'][$provider] . '; ' . $msg
                        : $msg;
                }
            }
        }
        return $result;
    }
}
