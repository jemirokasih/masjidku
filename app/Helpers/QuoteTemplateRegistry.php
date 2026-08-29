<?php

namespace App\Helpers;

/**
 * QuoteTemplateRegistry
 *
 * Central registry of all available Penawaran Harga (Quote) PDF templates.
 */
class QuoteTemplateRegistry
{
    /**
     * All registered quote templates.
     */
    private const TEMPLATES = [
        [
            'key'          => 'modern',
            'name'         => 'Modern Minimalis',
            'description'  => 'Surat Penawaran Harga modern bergaya kartu dengan aksen ungu, layout bersih, dan ringkasan syarat penawaran.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.quote_modern',
            'accent_color' => '#7c3aed',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '📜',
        ],
        [
            'key'          => 'classic',
            'name'         => 'Klasik Corporate',
            'description'  => 'Format penawaran harga resmi dengan bingkai ganda (double border), font klasik formal, syarat penawaran lengkap, dan kotak tanda tangan.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.quote_classic',
            'accent_color' => '#581c87',
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
