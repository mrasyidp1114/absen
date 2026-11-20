<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Jadwal;
use App\Models\SesiAbsensi;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SesiAbsensiController extends Controller
{
    private const HARI_MAP = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];

    public function kelasSaya(Request $request)
    {
        $guru = $request->user()->guru;

        return Jadwal::with('kelas')
            ->where('guru_id', $guru->id)
            ->get()
            ->pluck('kelas')
            ->unique('id')
            ->sortBy(fn ($k) => $k->tingkat.$k->nama)
            ->values();
    }

    public function jadwalHariIni(Request $request)
    {
        $guru = $request->user()->guru;
        $hariIni = self::HARI_MAP[now()->dayOfWeekIso];

        $jadwals = Jadwal::with('kelas', 'mapel')
            ->where('guru_id', $guru->id)
            ->where('hari', $hariIni)
            ->orderBy('jam_mulai')
            ->get();

        $sesiHariIni = SesiAbsensi::whereIn('jadwal_id', $jadwals->pluck('id'))
            ->whereDate('tanggal', now()->toDateString())
            ->get()
            ->keyBy('jadwal_id');

        $jadwals->each(function ($jadwal) use ($sesiHariIni) {
            $jadwal->sesi_hari_ini = $sesiHariIni->get($jadwal->id);
        });

        return response()->json(['hari' => $hariIni, 'jadwals' => $jadwals]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'jadwal_id' => ['required', 'exists:jadwals,id'],
            'batas_hadir' => ['nullable', 'integer', 'min:1'],
            'durasi_menit' => ['nullable', 'integer', 'min:1', 'max:180'],
        ]);

        $jadwal = Jadwal::with('kelas')->findOrFail($data['jadwal_id']);
        $this->authorizeJadwal($request, $jadwal);

        $sudahAktif = SesiAbsensi::where('jadwal_id', $jadwal->id)
            ->whereDate('tanggal', now()->toDateString())
            ->where('status', 'aktif')
            ->exists();

        if ($sudahAktif) {
            abort(422, 'Sudah ada sesi aktif untuk jadwal ini hari ini.');
        }

        $batasHadir = $data['batas_hadir'] ?? $jadwal->kelas->siswas()->count();
        $durasi = $data['durasi_menit'] ?? 15;

        $sesi = SesiAbsensi::create([
            'jadwal_id' => $jadwal->id,
            'tanggal' => now()->toDateString(),
            'token' => $this->generateUniqueToken(),
            'batas_hadir' => $batasHadir,
            'jumlah_hadir' => 0,
            'waktu_mulai' => now(),
            'waktu_berakhir' => now()->addMinutes($durasi),
            'status' => 'aktif',
        ]);

        return response()->json($sesi->load('jadwal.kelas', 'jadwal.mapel'), 201);
    }

    public function show(Request $request, SesiAbsensi $sesi)
    {
        $sesi->load('jadwal.kelas', 'jadwal.mapel', 'jadwal.guru');
        $this->authorizeJadwal($request, $sesi->jadwal);

        $siswas = $sesi->jadwal->kelas->siswas()->orderBy('nama')->get();
        $absensis = $sesi->absensis()->get()->keyBy('siswa_id');

        $daftarHadir = $siswas->map(function ($siswa) use ($absensis) {
            $absensi = $absensis->get($siswa->id);

            return [
                'siswa_id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->nama,
                'status' => $absensi?->status,
                'metode' => $absensi?->metode,
                'waktu_absen' => $absensi?->waktu_absen,
            ];
        });

        return response()->json([
            'sesi' => $sesi,
            'daftar_hadir' => $daftarHadir,
            'server_time' => now()->toIso8601String(),
        ]);
    }

    public function tutup(Request $request, SesiAbsensi $sesi)
    {
        $this->authorizeJadwal($request, $sesi->jadwal);

        $sesi->update(['status' => 'ditutup']);

        return $sesi;
    }

    public function absenManual(Request $request, SesiAbsensi $sesi)
    {
        $sesi->load('jadwal.kelas');
        $this->authorizeJadwal($request, $sesi->jadwal);

        $data = $request->validate([
            'siswa_id' => ['required', 'exists:siswas,id'],
            'status' => ['required', 'in:hadir,izin,sakit,alpa,terlambat'],
        ]);

        $siswaSatuKelas = $sesi->jadwal->kelas->siswas()->where('id', $data['siswa_id'])->exists();

        if (! $siswaSatuKelas) {
            abort(422, 'Siswa tidak terdaftar di kelas untuk jadwal ini.');
        }

        $absensi = Absensi::updateOrCreate(
            ['sesi_absensi_id' => $sesi->id, 'siswa_id' => $data['siswa_id']],
            [
                'status' => $data['status'],
                'metode' => 'manual',
                'waktu_absen' => now(),
                'dicatat_oleh_guru_id' => $request->user()->guru->id,
            ]
        );

        $sesi->jumlah_hadir = $sesi->absensis()->whereIn('status', ['hadir', 'terlambat'])->count();
        $sesi->save();

        return $absensi;
    }

    private function authorizeJadwal(Request $request, Jadwal $jadwal): void
    {
        $guru = $request->user()->guru;

        if (! $guru || $jadwal->guru_id !== $guru->id) {
            abort(403, 'Anda tidak memiliki akses ke jadwal ini.');
        }
    }

    private function generateUniqueToken(): string
    {
        do {
            $token = Str::random(48);
        } while (SesiAbsensi::where('token', $token)->exists());

        return $token;
    }
}
