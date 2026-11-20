<?php

namespace App\Http\Controllers\Api;

use App\Exports\RekapKelasExport;
use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Kelas;
use App\Models\Siswa;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class RekapController extends Controller
{
    private const STATUS_LIST = ['hadir', 'izin', 'sakit', 'alpa', 'terlambat'];

    public function kelasPeriode(Request $request, Kelas $kelas)
    {
        $this->authorizeKelas($request, $kelas);

        [$dari, $sampai, $mapelId] = $this->periodeParams($request);

        return response()->json([
            'kelas' => $kelas->nama_lengkap,
            'periode' => ['dari' => $dari, 'sampai' => $sampai],
            'data' => $this->buildKelasRekap($kelas, $dari, $sampai, $mapelId),
        ]);
    }

    public function siswaPeriode(Request $request, Siswa $siswa)
    {
        $this->authorizeKelas($request, $siswa->kelas);

        [$dari, $sampai] = $this->periodeParams($request);

        $absensis = Absensi::with('sesiAbsensi.jadwal.mapel')
            ->where('siswa_id', $siswa->id)
            ->whereHas('sesiAbsensi', fn ($q) => $q->whereBetween('tanggal', [$dari, $sampai]))
            ->orderByDesc('waktu_absen')
            ->get();

        $ringkasan = array_fill_keys(self::STATUS_LIST, 0);
        foreach ($absensis as $a) {
            $ringkasan[$a->status]++;
        }

        return response()->json([
            'siswa' => ['id' => $siswa->id, 'nisn' => $siswa->nisn, 'nama' => $siswa->nama, 'kelas' => $siswa->kelas->nama_lengkap],
            'periode' => ['dari' => $dari, 'sampai' => $sampai],
            'ringkasan' => $ringkasan,
            'detail' => $absensis,
        ]);
    }

    public function exportKelasExcel(Request $request, Kelas $kelas)
    {
        $this->authorizeKelas($request, $kelas);

        [$dari, $sampai, $mapelId] = $this->periodeParams($request);
        $rows = $this->buildKelasRekap($kelas, $dari, $sampai, $mapelId);

        return Excel::download(new RekapKelasExport($rows), "rekap-{$kelas->nama_lengkap}-{$dari}_sd_{$sampai}.xlsx");
    }

    public function exportKelasPdf(Request $request, Kelas $kelas)
    {
        $this->authorizeKelas($request, $kelas);

        [$dari, $sampai, $mapelId] = $this->periodeParams($request);
        $rows = $this->buildKelasRekap($kelas, $dari, $sampai, $mapelId);

        $pdf = Pdf::loadView('rekap.kelas-pdf', [
            'kelas' => $kelas->nama_lengkap,
            'dari' => $dari,
            'sampai' => $sampai,
            'rows' => $rows,
        ]);

        return $pdf->download("rekap-{$kelas->nama_lengkap}-{$dari}_sd_{$sampai}.pdf");
    }

    private function buildKelasRekap(Kelas $kelas, string $dari, string $sampai, ?int $mapelId): array
    {
        $siswas = $kelas->siswas()->orderBy('nama')->get();

        $counts = Absensi::select('siswa_id', 'status', DB::raw('count(*) as total'))
            ->whereIn('siswa_id', $siswas->pluck('id'))
            ->whereHas('sesiAbsensi', function ($q) use ($dari, $sampai, $mapelId) {
                $q->whereBetween('tanggal', [$dari, $sampai]);

                if ($mapelId) {
                    $q->whereHas('jadwal', fn ($q2) => $q2->where('mapel_id', $mapelId));
                }
            })
            ->groupBy('siswa_id', 'status')
            ->get()
            ->groupBy('siswa_id');

        return $siswas->map(function ($siswa) use ($counts) {
            $row = ['siswa_id' => $siswa->id, 'nisn' => $siswa->nisn, 'nama' => $siswa->nama];
            $row += array_fill_keys(self::STATUS_LIST, 0);

            foreach ($counts->get($siswa->id, collect()) as $c) {
                $row[$c->status] = $c->total;
            }

            $row['total'] = array_sum(array_intersect_key($row, array_flip(self::STATUS_LIST)));

            return $row;
        })->values()->all();
    }

    private function periodeParams(Request $request): array
    {
        $dari = $request->date('dari')?->toDateString() ?? now()->startOfMonth()->toDateString();
        $sampai = $request->date('sampai')?->toDateString() ?? now()->toDateString();
        $mapelId = $request->integer('mapel_id') ?: null;

        return [$dari, $sampai, $mapelId];
    }

    private function authorizeKelas(Request $request, Kelas $kelas): void
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return;
        }

        if ($user->isGuru() && $kelas->jadwals()->where('guru_id', $user->guru->id)->exists()) {
            return;
        }

        abort(403, 'Anda tidak memiliki akses ke rekap kelas ini.');
    }
}
