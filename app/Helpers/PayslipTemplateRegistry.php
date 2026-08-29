<?php

namespace App\Helpers;

/**
 * PayslipTemplateRegistry
 *
 * Central registry of all available Employee Payslip (Slip Gaji) PDF templates.
 */
class PayslipTemplateRegistry
{
    /**
     * All registered payslip templates.
     */
    private const TEMPLATES = [
        [
            'key'          => 'modern',
            'name'         => 'Modern Indigo',
            'description'  => 'Desain slip gaji modern dan bersih dengan aksen warna indigo/biru, tabel pendapatan & potongan berdampingan (dua kolom), rekap kehadiran, dan QR Code verifikasi.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.payslip_modern',
            'accent_color' => '#4f46e5',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '📄',
        ],
        [
            'key'          => 'classic',
            'name'         => 'Klasik Formal',
            'description'  => 'Format slip gaji formal resmi korporat dengan kop surat bergaris ganda, font Times New Roman / Serif, dan kolom tanda tangan ganda.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.payslip_classic',
            'accent_color' => '#1e293b',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '📋',
        ],
    ];

    /**
     * Get all registered templates.
     */
    public static function all(): array
    {
        return self::TEMPLATES;
    }

    /**
     * Get a single template config by key.
     */
    public static function find(string $key): array
    {
        foreach (self::TEMPLATES as $template) {
            if ($template['key'] === $key) {
                return $template;
            }
        }
        return self::TEMPLATES[0];
    }

    /**
     * Get all registered template keys.
     */
    public static function keys(): array
    {
        return array_column(self::TEMPLATES, 'key');
    }

    /**
     * Check if a key is registered.
     */
    public static function exists(string $key): bool
    {
        return in_array($key, self::keys(), true);
    }
}
