<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $modulesPath = app_path('Modules');

        if (!File::exists($modulesPath)) {
            return;
        }

        $modules = File::directories($modulesPath);

        foreach ($modules as $module) {
            $moduleName = basename($module);

            // Register Module API Routes
            $apiRoutesPath = $module . '/Routes/api.php';
            if (File::exists($apiRoutesPath)) {
                Route::middleware('api')
                    ->prefix('api/v1')
                    ->group($apiRoutesPath);
            }

            // Register Module Web Routes if exists
            $webRoutesPath = $module . '/Routes/web.php';
            if (File::exists($webRoutesPath)) {
                Route::middleware('web')
                    ->group($webRoutesPath);
            }

            // Register Module Migrations
            $migrationsPath = $module . '/Database/Migrations';
            if (File::exists($migrationsPath)) {
                $this->loadMigrationsFrom($migrationsPath);
            }
        }
    }
}
