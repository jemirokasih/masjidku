<?php
/**
 * Official Roundcube Webmail v1.7.3 Configuration
 * Mikrotek Business Suite Neo Integration (MySQL Edition)
 */

$config = [];

// Defaults
$companyName = 'Mikrotek Business Suite';
$defaultImapHost = 'ssl://mail.mzi.co.id:993';
$defaultSmtpHost = 'tls://mail.mzi.co.id:587';

$dbUser = 'jemirokasih';
$dbPass = '';
$dbHost = '127.0.0.1';
$dbPort = '3306';
$dbName = 'mikrotek_neo';

// 1. If Laravel is already booted in this request context
if (function_exists('config')) {
    $dbUser = config('database.connections.mysql.username', $dbUser);
    $dbPass = config('database.connections.mysql.password', $dbPass);
    $dbHost = config('database.connections.mysql.host', $dbHost);
    $dbPort = config('database.connections.mysql.port', $dbPort);
    $dbName = config('database.connections.mysql.database', $dbName);

    try {
        $setting = \App\Modules\Settings\Models\CompanySetting::first();
        if ($setting) {
            if (!empty($setting->company_name)) {
                $companyName = $setting->company_name;
            }

            // IMAP Host
            if (!empty($setting->webmail_imap_host)) {
                $host = $setting->webmail_imap_host;
                $port = $setting->webmail_imap_port ?: 993;
                $enc = strtolower($setting->webmail_imap_encryption ?: 'ssl');
                $prefix = ($enc === 'ssl') ? 'ssl://' : (($enc === 'tls') ? 'tls://' : '');
                $defaultImapHost = $prefix . $host . ':' . $port;
            }

            // SMTP Host
            if (!empty($setting->webmail_smtp_host)) {
                $sHost = $setting->webmail_smtp_host;
                $sPort = $setting->webmail_smtp_port ?: 587;
                $sEnc = strtolower($setting->webmail_smtp_encryption ?: 'tls');
                $sPrefix = ($sEnc === 'ssl') ? 'ssl://' : (($sEnc === 'tls') ? 'tls://' : '');
                $defaultSmtpHost = $sPrefix . $sHost . ':' . $sPort;
            }
        }
    } catch (\Throwable $e) {
        // Silently continue
    }
} else {
    // 2. Standalone fallback: Read .env directly without booting kernel
    $envFile = dirname(__DIR__, 3) . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                if ($key === 'DB_USERNAME') $dbUser = $value;
                if ($key === 'DB_PASSWORD') $dbPass = $value;
                if ($key === 'DB_HOST') $dbHost = $value;
                if ($key === 'DB_PORT') $dbPort = $value;
                if ($key === 'DB_DATABASE') $dbName = $value;
            }
        }
    }
}

// Database Configuration (MySQL with rc_ prefix)
$dbPassEncoded = urlencode($dbPass);
$config['db_dsnw'] = "mysql://{$dbUser}:{$dbPassEncoded}@{$dbHost}:{$dbPort}/{$dbName}?charset=utf8mb4";
$config['db_prefix'] = 'rc_';

// IMAP & SMTP Settings
$config['imap_host'] = $defaultImapHost;
$config['smtp_host'] = $defaultSmtpHost;
$config['smtp_user'] = '%u';
$config['smtp_pass'] = '%p';

// SSL/TLS Connection Options (allow self-signed or hosting mail certs)
$config['imap_conn_options'] = [
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true,
    ],
];
$config['smtp_conn_options'] = [
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true,
    ],
];

// Product Branding
$config['product_name'] = $companyName . ' Webmail';
$config['support_url'] = '';

// DES Key for Encryption (24 characters)
$config['des_key'] = 'rcmbsneo2026sec!24bytekey';

// Active Plugins & Modern Elastic Skin
$config['plugins'] = [
    'archive',
    'zipdownload',
];

$config['skin'] = 'elastic';
$config['assets_path'] = '/webmail/';
$config['imap_auth_type'] = null;
$config['auto_create_user'] = true;
$config['enable_installer'] = false;
$config['session_lifetime'] = 120;
$config['ip_check'] = false;
