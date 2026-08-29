<?php

namespace App\Helpers;

/**
 * InvoiceTemplateRegistry
 *
 * Central registry of all available Invoice PDF templates.
 */
class InvoiceTemplateRegistry
{
    /**
     * All registered invoice templates.
     */
    private const TEMPLATES = [
        [
            'key'          => 'modern',
            'name'         => 'Modern Minimalis',
            'description'  => 'Tagihan Invoice modern bergaya clean, header aksen indigo, detail ringkasan terstruktur, dan QR/tanda tangan digital.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.invoice_modern',
            'accent_color' => '#4f46e5',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '📄',
        ],
        [
            'key'          => 'classic',
            'name'         => 'Klasik Corporate',
            'description'  => 'Format invoice resmi korporat dengan bingkai ganda (double border), font klasik, rincian instruksi bank, dan stempel/tanda tangan basah.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.invoice_classic',
            'accent_color' => '#1e293b',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '🏛️',
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
