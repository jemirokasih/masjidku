<?php

namespace App\Providers;

use App\Modules\Settings\Models\CompanySetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            if (Schema::hasTable('mbs_company_settings')) {
                $setting = CompanySetting::first();
                if ($setting && !empty($setting->timezone)) {
                    date_default_timezone_set($setting->timezone);
                    Config::set('app.timezone', $setting->timezone);
                }
            }
        } catch (\Throwable $e) {
            // Silently fallback if database not ready yet during setup
        }
    }
}
