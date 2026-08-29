<?php

namespace App\Helpers;

/**
 * ContractTemplateRegistry
 *
 * Central registry of all available Employee Contract PDF templates.
 */
class ContractTemplateRegistry
{
    /**
     * All registered contract templates.
     */
    private const TEMPLATES = [
        [
            'key'          => 'formal',
            'name'         => 'Formal Resmi',
            'description'  => 'Surat Perjanjian Kerja format korporat formal dengan kop surat, double border, font Times New Roman, dan kolom tanda tangan lengkap.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.contract_formal',
            'accent_color' => '#1e293b',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '📋',
        ],
        [
            'key'          => 'modern',
            'name'         => 'Modern Minimalis',
            'description'  => 'Surat Kontrak Kerja bergaya modern bersih, header aksen indigo, tabel ringkasan data karyawan, dan pasal-pasal berstruktur rapi.',
            'paper'        => 'A4',
            'orientation'  => 'portrait',
            'blade_view'   => 'pdf.contract_modern',
            'accent_color' => '#4f46e5',
            'author'       => 'Mikrotek Core Team',
            'version'      => '1.0',
            'preview_icon' => '📄',
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
