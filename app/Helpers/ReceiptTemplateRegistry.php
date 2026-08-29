<?php

namespace App\Helpers;

/**
 * ReceiptTemplateRegistry
 *
 * Central registry of all available kwitansi PDF templates.
 *
 * ─── HOW TO ADD A NEW TEMPLATE ────────────────────────────────────────────────
 *
 *  1. Create your blade file:
 *       resources/views/pdf/receipt_<key>.blade.php
 *     The view receives two variables:
 *       $payment  → App\Modules\Payments\Models\Payment (with invoice.client, paymentMethod)
 *       $company  → App\Modules\Settings\Models\CompanySetting
 *
 *  2. Add an entry to the TEMPLATES array below.
 *     Required keys  : key, name, description, paper, orientation, blade_view
 *     Optional keys  : accent_color, author, version, preview_icon
 *
 *  3. Done! The template will automatically appear in:
 *     - Pengaturan Sistem → tab "Template Kwitansi"
 *     - Dropdown "Opsi Aksi" on the Pembayaran page
 *
 * ──────────────────────────────────────────────────────────────────────────────
 */
class ReceiptTemplateRegistry
{
    /**
     * All registered receipt templates.
     * Order matters — first entry is shown first in the UI.
     */
    private const TEMPLATES = [
        [
            'key'          => 'modern',
            'name'         => 'Modern Minimalis',
            'description'  => 'Kwitansi modern bergaya kartu dengan aksen hijau, layout bersih, dan ringkasan invoice.',
            'paper'        => 'A5',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.receipt_modern',
            'accent_color' => '#059669',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '🟢',
        ],
        [
            'key'          => 'classic',
            'name'         => 'Klasik Tradisional',
            'description'  => 'Format kwitansi fisik klasik: frame ganda, stempel LUNAS, garis form, dan layout landscape.',
            'paper'        => 'A5',
            'orientation'  => 'landscape',
            'blade_view'   => 'pdf.receipt_classic',
            'accent_color' => '#92400e',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '🟡',
        ],
        // ── Add your custom templates below ──────────────────────────────────
        // [
        //     'key'          => 'thermal',
        //     'name'         => 'Thermal 58mm',
        //     'description'  => 'Format struk kasir thermal printer 58mm.',
        //     'paper'        => 'A7',
        //     'orientation'  => 'portrait',
        //     'blade_view'   => 'pdf.receipt_thermal',
        //     'accent_color' => '#374151',
        //     'author'       => 'Your Name',
        //     'version'      => '1.0',
        //     'preview_icon' => '⬛',
        // ],
    ];

    /**
     * Get all registered templates as array.
     */
    public static function all(): array
    {
        return self::TEMPLATES;
    }

    /**
     * Get a single template config by key.
     * Falls back to the first registered template if key not found.
     */
    public static function find(string $key): array
    {
        foreach (self::TEMPLATES as $template) {
            if ($template['key'] === $key) {
                return $template;
            }
        }
        // Fallback to first template
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
