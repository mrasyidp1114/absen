<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Kelas>
 */
class KelasFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tingkat' => fake()->randomElement(['7', '8', '9']),
            'nama' => fake()->randomElement(['A', 'B', 'C', 'D']),
        ];
    }
}
