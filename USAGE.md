# Mikrotek Theme – Usage Guide

This guide explains how to install, publish, build, configure, and use the **Mikrotek Theme** package in any Laravel project.

---

## 1. Installation
```bash
composer require jemirokasih/mikrotek-theme
```
This adds the package as a Composer dependency.

---

## 2. Publish assets
The package provides config, migrations, and compiled front‑end assets. Publish them with:
```bash
php artisan vendor:publish \
    --provider="App\Providers\MikrotekThemeServiceProvider" \
    --tag=mikrotek-theme
```
* `config/mikrotek-theme.php` – default configuration.
* `database/migrations/...` – any migrations the theme ships.
* `public/build/...` – compiled React/Vite assets.

---

## 3. Build front‑end assets
The theme ships a `package.json` with Vite + React. After publishing, run:
```bash
npm install        # install node dependencies
npm run build      # production build
# or for local development
npm run dev        # hot‑reload dev server
```
The compiled files are placed in `public/build` and served by Laravel.

---

## 4. Configuration
Edit the published config file to suit your project:
```php
return [
    // Name displayed in UI
    'theme_name' => env('MIKROTEK_THEME_NAME', 'Mikrotek Theme'),

    // Sanctum guard used by the auth routes
    'auth_guard' => env('MIKROTEK_AUTH_GUARD', 'sanctum'),
];
```
You can set the environment variables in your `.env` file.

---

## 5. Auth routes (provided by the package)
| Method | URI | Description |
|--------|-----|-------------|
| **POST** | `/auth/login` | Returns a Sanctum token for a valid user. |
| **GET**  | `/auth/me`   | Returns the authenticated user (protected). |
| **POST** | `/auth/logout` | Revokes the current token (protected). |

All routes are automatically loaded by the service provider.

---

## 6. Scaffold script (optional)
A helper script `bin/create-app.sh` is included. It can bootstrap a fresh Laravel project with this theme pre‑installed:
```bash
bash bin/create-app.sh <new‑project‑directory>
```
The script performs:
1. Copies the theme files into the target directory.
2. Runs `composer install`.
3. Runs `npm install && npm run build`.
4. Publishes assets (`php artisan vendor:publish`).
5. Runs migrations.
6. Starts the Laravel dev server and Vite dev server.

---

## 7. Testing
The package ships feature tests. Run them with:
```bash
php artisan test
```
All tests should pass before you publish the package.

---

## 8. Example prompt usage
When using the AI‑powered prompt system, you can refer to this theme like so:
> **"Buat Aplikasi X, gunakan template Mikrotek-Themes-Build"**
The prompt will scaffold a new Laravel project with the theme fully configured.

---

## 9. Frequently asked questions
- **Do I need to run `npm run dev` after publishing?**
  Only for local development. For production, run `npm run build`.
- **Can I customize the front‑end?**
  Yes. The source is under `resources/js` inside the theme. Modify and re‑run the build.
- **Where are the compiled assets?**
  In `public/build` after running the build script.

---

Enjoy building beautiful Laravel applications with the Mikrotek Theme!

