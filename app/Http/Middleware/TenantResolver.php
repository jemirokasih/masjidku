<?php

namespace App\Http\Middleware;

use App\Models\Masjid;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantResolver
{
    /**
     * Resolve the Mosque tenant from route parameter, subdomain, custom domain, or X-Tenant-Slug header.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $identifier = $request->route('identifier') 
            ?? $request->route('slug')
            ?? $request->header('X-Tenant-Slug');

        // If not found in parameters/headers, check subdomain or custom domain
        if (!$identifier) {
            $host = $request->getHost();
            $baseDomain = config('app.url_domain', 'masjidku.com');
            
            if ($host !== $baseDomain && $host !== 'localhost' && $host !== '127.0.0.1') {
                if (str_ends_with($host, '.' . $baseDomain)) {
                    $identifier = str_replace('.' . $baseDomain, '', $host);
                } else {
                    // Could be a custom domain
                    $masjid = Masjid::where('custom_domain', $host)->first();
                    if ($masjid) {
                        $request->attributes->set('tenant_masjid', $masjid);
                        return $next($request);
                    }
                }
            }
        }

        if ($identifier) {
            $masjid = Masjid::where('slug', $identifier)
                ->orWhere('custom_domain', $identifier)
                ->first();

            if ($masjid) {
                $request->attributes->set('tenant_masjid', $masjid);
            }
        }

        return $next($request);
    }
}

