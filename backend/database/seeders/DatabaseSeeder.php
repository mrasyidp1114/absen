<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Administrator',
            'username' => 'admin',
            'email' => 'admin@sekolah.test',
            'role' => 'admin',
        ]);

        $mapelData = [
            ['kode' => 'MTK', 'nama_mapel' => 'Matematika'],
            ['kode' => 'BIN', 'nama_mapel' => 'Bahasa Indonesia'],
            ['kode' => 'BIG', 'nama_mapel' => 'Bahasa Inggris'],
            ['kode' => 'IPA', 'nama_mapel' => 'Ilmu Pengetahuan Alam'],
            ['kode' => 'IPS', 'nama_mapel' => 'Ilmu Pengetahuan Sosial'],
            ['kode' => 'PKN', 'nama_mapel' => 'Pendidikan Pancasila'],
            ['kode' => 'AGM', 'nama_mapel' => 'Pendidikan Agama'],
            ['kode' => 'PJK', 'nama_mapel' => 'Pendidikan Jasmani'],
            ['kode' => 'SBD', 'nama_mapel' => 'Seni Budaya'],
            ['kode' => 'PKR', 'nama_mapel' => 'Prakarya'],
        ];
        $mapels = collect($mapelData)->map(fn ($m) => Mapel::create($m));

        $gurus = Guru::factory(14)->create();

        $guruPerMapel = $mapels->mapWithKeys(
            fn ($mapel, $i) => [$mapel->id => $gurus[$i % $gurus->count()]]
        );

        $tingkatList = ['7', '8', '9'];
        $namaKelasList = ['A', 'B', 'C', 'D'];
        $kelasList = collect();
        $waliIndex = 0;

        foreach ($tingkatList as $tingkat) {
            foreach ($namaKelasList as $namaKelas) {
                $kelas = Kelas::create([
                    'tingkat' => $tingkat,
                    'nama' => $namaKelas,
                    'wali_kelas_id' => $gurus[$waliIndex % $gurus->count()]->id,
                ]);
                $kelasList->push($kelas);
                $waliIndex++;
            }
        }

        foreach ($kelasList as $kelas) {
            Siswa::factory(rand(30, 34))->create(['kelas_id' => $kelas->id]);
        }

        $hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $jamSlots = [
            ['07:00', '07:40'],
            ['07:40', '08:20'],
            ['08:20', '09:00'],
            ['09:20', '10:00'],
            ['10:00', '10:40'],
        ];

        foreach ($kelasList as $kelas) {
            $mapelPool = $mapels->shuffle();

            foreach ($hariList as $hariIndex => $hari) {
                foreach ($jamSlots as $slotIndex => $slot) {
                    $mapel = $mapelPool[($hariIndex * count($jamSlots) + $slotIndex) % $mapelPool->count()];
                    $guru = $guruPerMapel[$mapel->id];

                    Jadwal::create([
                        'kelas_id' => $kelas->id,
                        'mapel_id' => $mapel->id,
                        'guru_id' => $guru->id,
                        'hari' => $hari,
                        'jam_mulai' => $slot[0],
                        'jam_selesai' => $slot[1],
                    ]);
                }
            }
        }
    }
}
