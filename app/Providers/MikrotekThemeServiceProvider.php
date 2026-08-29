<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class MikrotekThemeServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Load routes from Settings and Auth modules
        $this->loadRoutesFrom(__DIR__ . '/../Modules/Settings/Routes/api.php');
        $this->loadRoutesFrom(__DIR__ . '/../Modules/Auth/Routes/api.php');

        // Publish migrations, config, and public assets
        $this->publishes([
            __DIR__ . '/../database/migrations/' => database_path('migrations'),
            __DIR__ . '/../config/mikrotek-theme.php' => config_path('mikrotek-theme.php'),
            __DIR__ . '/../../public/build' => public_path('vendor/mikrotek-theme'),
        ], 'mikrotek-theme');
    }

    public function register()
    {
        // Merge default config
        $this->mergeConfigFrom(__DIR__ . '/../config/mikrotek-theme.php', 'mikrotek-theme');
    }
}
