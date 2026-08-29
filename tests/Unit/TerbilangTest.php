<?php

namespace Tests\Unit;

use App\Helpers\Terbilang;
use PHPUnit\Framework\TestCase;

class TerbilangTest extends TestCase
{
    public function test_terbilang_conversion(): void
    {
        $this->assertEquals('Nol Rupiah', Terbilang::make(0));
        $this->assertEquals('Satu Rupiah', Terbilang::make(1));
        $this->assertEquals('Sebelas Rupiah', Terbilang::make(11));
        $this->assertEquals('Seratus Lima Puluh Ribu Rupiah', Terbilang::make(150000));
        $this->assertEquals('Satu Juta Lima Ratus Ribu Rupiah', Terbilang::make(1500000));
        $this->assertEquals('Enam Belas Juta Enam Ratus Lima Puluh Ribu Rupiah', Terbilang::make(16650000));
        $this->assertEquals('Satu Miliar Rupiah', Terbilang::make(1000000000));
    }
}
