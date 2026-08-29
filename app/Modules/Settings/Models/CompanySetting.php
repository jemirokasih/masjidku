<?php

namespace App\Modules\Settings\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Config;

class CompanySetting extends Model
{
    use HasFactory;

    protected $table = 'mbs_company_settings';

    protected $fillable = [
        'company_name',
        'is_setup_completed',
        'company_email',
        'company_phone',
        'company_address',
        'timezone',
        'tax_number',
        'currency_code',
        'currency_symbol',
        'logo_path',

        'mail_mailer',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',

        'backup_directory_path',
        'backup_retention_days',
        'backup_auto_schedule',
        'backup_driver',
        'backup_last_run_at',
        'backup_last_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'mail_password',
    ];

    protected $casts = [
        'is_setup_completed' => 'boolean',
        'backup_last_run_at' => 'datetime',
    ];

    protected $appends = [
        'timezone_label',
    ];

    /**
     * Human readable timezone label (WIB, WITA, WIT, etc.)
     */
    public function getTimezoneLabelAttribute(): string
    {
        $tz = $this->timezone ?? 'Asia/Jakarta';
        return match ($tz) {
            'Asia/Jakarta', 'Asia/Pontianak' => 'WIB (UTC+7)',
            'Asia/Makassar', 'Asia/Ujung_Pandang', 'Asia/Bali', 'Asia/Banjarmasin' => 'WITA (UTC+8)',
            'Asia/Jayapura' => 'WIT (UTC+9)',
            'Asia/Singapore' => 'SGT (UTC+8)',
            'Asia/Bangkok' => 'ICT (UTC+7)',
            'UTC' => 'UTC (GMT+0)',
            default => $tz,
        };
    }

    /**
     * Get or create single company setting instance
     */
    public static function instance(): self
    {
        $setting = static::first();
        if (!$setting) {
            $setting = static::create([
                'company_name' => 'PT Mikrotek Zemiro Indonesia',
                'company_email' => 'admin@example.com',
                'company_phone' => '021-5550192',
                'company_address' => 'Jl. TB Simatupang No. 88, Jakarta Selatan',
                'tax_number' => '01.234.567.8-012.000',
                'currency_code' => 'IDR',
                'currency_symbol' => 'Rp',
                'timezone' => 'Asia/Jakarta',
                'mail_mailer' => 'smtp',
                'mail_host' => 'smtp.gmail.com',
                'mail_port' => 587,
                'mail_username' => 'noreply@example.com',
                'mail_password' => '',
                'mail_encryption' => 'tls',
                'mail_from_address' => 'noreply@example.com',
                'mail_from_name' => 'Mikrotek System',
            ]);
        }
        return $setting;
    }

    /**
     * Safe sanitized company profile for public views
     */
    public function publicProfile(): array
    {
        return [
            'company_name' => $this->company_name,
            'company_email' => $this->company_email,
            'company_phone' => $this->company_phone,
            'company_address' => $this->company_address,
            'tax_number' => $this->tax_number,
            'currency_code' => $this->currency_code,
            'currency_symbol' => $this->currency_symbol,
            'timezone' => $this->timezone,
            'logo_path' => $this->logo_path,
        ];
    }

    /**
     * Apply stored SMTP settings to runtime Laravel mail config dynamically
     */
    public function applySmtpConfig(): void
    {
        if ($this->mail_host) {
            Config::set('mail.default', $this->mail_mailer ?? 'smtp');
            Config::set('mail.mailers.smtp.host', $this->mail_host);
            Config::set('mail.mailers.smtp.port', $this->mail_port ?? 587);
            Config::set('mail.mailers.smtp.username', $this->mail_username);
            Config::set('mail.mailers.smtp.password', $this->mail_password);
            Config::set('mail.mailers.smtp.scheme', $this->mail_encryption);
            Config::set('mail.from.address', $this->mail_from_address ?? $this->company_email);
            Config::set('mail.from.name', $this->mail_from_name ?? $this->company_name);
        }
    }
}
