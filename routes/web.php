<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\PersonalAccessToken;

Route::get('/login', function () {
    return view('app');
})->name('login');

// Standalone Official Roundcube Webmail Route Handler (v1.7.3)
Route::any('/webmail/{any?}', function (Request $request) {
    $webmailDir = public_path('webmail');
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '';
    
    // Path relative to /webmail/
    $subPath = str_starts_with($uri, '/webmail/') ? substr($uri, strlen('/webmail/')) : '';
    $subPath = ltrim($subPath, '/');

    // Handle static assets requested via static.php or direct skin/plugin paths
    if (str_starts_with($subPath, 'static.php')) {
        $filePath = substr($subPath, strlen('static.php'));
        $filePath = ltrim(strtok($filePath, '?'), '/');
        
        $assetFile = $webmailDir . '/' . $filePath;
        if (file_exists($assetFile) && !is_dir($assetFile)) {
            $ext = strtolower(pathinfo($assetFile, PATHINFO_EXTENSION));
            $mime = match ($ext) {
                'css' => 'text/css',
                'js' => 'application/javascript',
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'woff' => 'font/woff',
                'woff2' => 'font/woff2',
                'ico' => 'image/x-icon',
                default => mime_content_type($assetFile) ?: 'application/octet-stream',
            };
            return response()->file($assetFile, ['Content-Type' => $mime]);
        }
    }

    if (!empty($subPath) && !str_ends_with($subPath, '.php') && !str_starts_with($subPath, '?')) {
        $realAsset = $webmailDir . '/' . strtok($subPath, '?');
        if (file_exists($realAsset) && !is_dir($realAsset)) {
            $ext = strtolower(pathinfo($realAsset, PATHINFO_EXTENSION));
            $mime = match ($ext) {
                'css' => 'text/css',
                'js' => 'application/javascript',
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'woff' => 'font/woff',
                'woff2' => 'font/woff2',
                'ico' => 'image/x-icon',
                default => mime_content_type($realAsset) ?: 'application/octet-stream',
            };
            return response()->file($realAsset, ['Content-Type' => $mime]);
        }
    }

    // Authentication Guard: Prevent public unauthenticated access
    $isAuthenticated = false;
    if (auth()->check()) {
        $isAuthenticated = true;
    } else {
        $token = $request->bearerToken() 
            ?? $request->query('auth_token') 
            ?? $request->cookie('auth_token') 
            ?? $request->cookie('mbs_token');

        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken && (!$accessToken->expires_at || $accessToken->expires_at->isFuture())) {
                $isAuthenticated = true;
                
                // Persist token in cookie for subsequent Roundcube requests/links
                if ($request->has('auth_token')) {
                    setcookie('auth_token', $token, time() + 7200, '/', '', false, true);
                }
            }
        }
    }

    if (!$isAuthenticated) {
        return redirect('/login');
    }

    // Release any PHP session lock held by Laravel before executing Roundcube
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_write_close();
    }

    // Override server parameters so Roundcube knows it runs in /webmail/index.php
    $_SERVER['SCRIPT_NAME'] = '/webmail/index.php';
    $_SERVER['PHP_SELF'] = '/webmail/index.php';
    $_SERVER['SCRIPT_FILENAME'] = $webmailDir . '/index.php';

    // Standalone Roundcube Index Execution (preserves headers, cookies & session)
    chdir($webmailDir);
    require $webmailDir . '/index.php';
    exit;
})->where('any', '.*');

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|webmail).*$');

// Health check route
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
