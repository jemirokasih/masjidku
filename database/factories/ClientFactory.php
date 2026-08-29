<?php

namespace Database\Factories;

use App\Modules\Clients\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'code' => 'CLI-' . $this->faker->unique()->numberBetween(1000, 9999),
            'name' => $this->faker->name(),
            'company_name' => $this->faker->company(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'is_active' => true,
        ];
    }
}
