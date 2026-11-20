<?php

namespace Database\Factories;

use App\Models\Kelas;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Siswa>
 */
class SiswaFactory extends Factory
{
    public function definition(): array
    {
        $jenisKelamin = fake()->randomElement(['L', 'P']);
        $nama = $jenisKelamin === 'L' ? fake()->firstNameMale().' '.fake()->lastName() : fake()->firstNameFemale().' '.fake()->lastName();
        $nisn = fake()->unique()->numerify('##########');

        return [
            'user_id' => User::factory()->state([
                'name' => $nama,
                'username' => $nisn,
                'role' => 'siswa',
            ]),
            'nisn' => $nisn,
            'nama' => $nama,
            'jenis_kelamin' => $jenisKelamin,
            'kelas_id' => Kelas::factory(),
        ];
    }
}
