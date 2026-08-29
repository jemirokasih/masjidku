<?php

namespace App\Helpers;

class DocumentNumberFormatter
{
    /**
     * Format a document number dynamically based on pattern.
     *
     * Tags available:
     * - {NUMBER} : Padded sequential number (e.g. 001, 081, 0001)
     * - {PREFIX} : Custom document prefix (e.g. MZIINV, QUO, PAY)
     * - {YEAR}   : 4-digit year (e.g. 2026)
     * - {YY}     : 2-digit year (e.g. 26)
     * - {MONTH}  : 2-digit month (e.g. 09)
     * - {DAY}    : 2-digit day (e.g. 22)
     */
    public static function format(
        string $pattern = '{NUMBER}/{PREFIX}/{MONTH}/{YEAR}',
        ?string $prefix = '',
        int $number = 1,
        int $digits = 3,
        ?\DateTimeInterface $date = null
    ): string {
        $date = $date ?? now();

        $paddedNumber = str_pad((string)$number, max(1, $digits), '0', STR_PAD_LEFT);
        $yearFull     = $date->format('Y');
        $yearShort    = $date->format('y');
        $month        = $date->format('m');
        $day          = $date->format('d');

        $replacements = [
            '{NUMBER}' => $paddedNumber,
            '{PREFIX}' => trim($prefix ?? ''),
            '{YEAR}'   => $yearFull,
            '{YY}'     => $yearShort,
            '{MONTH}'  => $month,
            '{DAY}'    => $day,
        ];

        return strtr($pattern, $replacements);
    }
}
