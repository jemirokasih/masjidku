<?php

namespace App\Helpers;

class Terbilang
{
    private static array $units = [
        "", "Satu", "Dua", "Tiga", "Empat", "Lima",
        "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
    ];

    public static function make($number, string $suffix = 'Rupiah'): string
    {
        $number = (float)$number;

        if ($number < 0) {
            return 'Minus ' . trim(self::convert(abs($number)) . ' ' . $suffix);
        }

        if ($number == 0) {
            return 'Nol ' . $suffix;
        }

        $result = trim(self::convert($number));
        // Fix double spaces
        $result = preg_replace('/\s+/', ' ', $result);

        return $suffix ? $result . ' ' . $suffix : $result;
    }

    private static function convert(float $n): string
    {
        $n = floor($n);

        if ($n < 12) {
            return self::$units[(int)$n];
        } elseif ($n < 20) {
            return self::convert($n - 10) . " Belas";
        } elseif ($n < 100) {
            return self::convert(floor($n / 10)) . " Puluh " . self::convert($n % 10);
        } elseif ($n < 200) {
            return "Seratus " . self::convert($n - 100);
        } elseif ($n < 1000) {
            return self::convert(floor($n / 100)) . " Ratus " . self::convert($n % 100);
        } elseif ($n < 2000) {
            return "Seribu " . self::convert($n - 1000);
        } elseif ($n < 1000000) {
            return self::convert(floor($n / 1000)) . " Ribu " . self::convert($n % 1000);
        } elseif ($n < 1000000000) {
            return self::convert(floor($n / 1000000)) . " Juta " . self::convert($n % 1000000);
        } elseif ($n < 1000000000000) {
            return self::convert(floor($n / 1000000000)) . " Miliar " . self::convert(fmod($n, 1000000000));
        } elseif ($n < 1000000000000000) {
            return self::convert(floor($n / 1000000000000)) . " Triliun " . self::convert(fmod($n, 1000000000000));
        }

        return (string)$n;
    }
}
