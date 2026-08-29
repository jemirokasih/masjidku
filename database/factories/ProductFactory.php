<?php

namespace Database\Factories;

use App\Modules\Products\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'code' => 'PRD-' . $this->faker->unique()->numberBetween(100, 999),
            'name' => $this->faker->words(3, true),
            'category' => 'Web Development',
            'unit' => 'Paket',
            'unit_price' => $this->faker->randomFloat(2, 500000, 10000000),
            'is_active' => true,
        ];
    }
}
