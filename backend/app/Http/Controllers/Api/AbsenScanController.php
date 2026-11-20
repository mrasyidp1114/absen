<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Jadwal;
use App\Models\SesiAbsensi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbsenScanController extends Controller
{
    private const HARI_MAP = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];

    public function jadwalHariIni(Request $request)
    {
        $siswa = $request->user()->siswa;
        $hariIni = self::HARI_MAP[now()->dayOfWeekIso];

        $jadwals = Jadwal::with('mapel', 'guru')
            ->where('kelas_id', $siswa->kelas_id)
            ->where('hari', $hariIni)
            ->orderBy('jam_mulai')
            ->get();

        return response()->json(['hari' => $hariIni, 'jadwals' => $jadwals]);
    }

    public function scan(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $siswa = $request->user()->siswa;

        if (! $siswa) {
            abort(403, 'Akun ini bukan akun siswa.');
        }

        return DB::transaction(function () use ($data, $siswa) {
            $sesi = SesiAbsensi::with('jadwal')->where('token', $data['token'])->lockForUpdate()->first();

            if (! $sesi) {
                abort(404, 'QR tidak valid atau sudah tidak berlaku.');
            }

            if ($sesi->jadwal->kelas_id !== $siswa->kelas_id) {
                abort(403, 'QR ini bukan untuk kelas Anda.');
            }

            $sudahAbsen = Absensi::where('sesi_absensi_id', $sesi->id)->where('siswa_id', $siswa->id)->exists();

            if ($sudahAbsen) {
                abort(422, 'Anda sudah absen pada sesi ini.');
            }

            if ($sesi->isWaktuHabis()) {
                abort(422, 'Waktu absen sudah habis. Minta guru untuk mencatat kehadiran Anda secara manual.');
            }

            if ($sesi->status !== 'aktif' || $sesi->isPenuh()) {
                abort(422, 'Sesi absen sudah ditutup. Minta guru untuk mencatat kehadiran Anda secara manual.');
            }

            $absensi = Absensi::create([
                'sesi_absensi_id' => $sesi->id,
                'siswa_id' => $siswa->id,
                'status' => 'hadir',
                'metode' => 'qr',
                'waktu_absen' => now(),
            ]);

            $sesi->jumlah_hadir += 1;

            if ($sesi->jumlah_hadir >= $sesi->batas_hadir) {
                $sesi->status = 'ditutup';
            }

            $sesi->save();

            return response()->json([
                'message' => 'Absen berhasil.',
                'absensi' => $absensi,
            ]);
        });
    }

    public function riwayat(Request $request)
    {
        $siswa = $request->user()->siswa;

        $query = Absensi::with('sesiAbsensi.jadwal.mapel', 'sesiAbsensi.jadwal.kelas')
            ->where('siswa_id', $siswa->id)
            ->orderByDesc('waktu_absen');

        if ($request->filled('dari')) {
            $query->whereDate('waktu_absen', '>=', $request->date('dari'));
        }

        if ($request->filled('sampai')) {
            $query->whereDate('waktu_absen', '<=', $request->date('sampai'));
        }

        return $query->paginate(50);
    }
}
