<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Guru>
 */
class GuruFactory extends Factory
{
    public function definition(): array
    {
        $nama = fake()->name();
        $nip = fake()->unique()->numerify('##################');

        return [
            'user_id' => User::factory()->state([
                'name' => $nama,
                'username' => $nip,
                'role' => 'guru',
            ]),
            'nip' => $nip,
            'nama' => $nama,
        ];
    }
}
