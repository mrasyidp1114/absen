<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Http\Request;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $query = Jadwal::with('kelas', 'mapel', 'guru');

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->integer('kelas_id'));
        }

        if ($request->filled('guru_id')) {
            $query->where('guru_id', $request->integer('guru_id'));
        }

        if ($request->filled('hari')) {
            $query->where('hari', $request->string('hari'));
        }

        return $query->orderBy('hari')->orderBy('jam_mulai')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kelas_id' => ['required', 'exists:kelas,id'],
            'mapel_id' => ['required', 'exists:mapels,id'],
            'guru_id' => ['required', 'exists:gurus,id'],
            'hari' => ['required', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
        ]);

        $this->ensureNoOverlap($data);

        return response()->json(Jadwal::create($data)->load('kelas', 'mapel', 'guru'), 201);
    }

    public function show(Jadwal $jadwal)
    {
        return $jadwal->load('kelas', 'mapel', 'guru');
    }

    public function update(Request $request, Jadwal $jadwal)
    {
        $data = $request->validate([
            'kelas_id' => ['required', 'exists:kelas,id'],
            'mapel_id' => ['required', 'exists:mapels,id'],
            'guru_id' => ['required', 'exists:gurus,id'],
            'hari' => ['required', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
        ]);

        $this->ensureNoOverlap($data, $jadwal->id);

        $jadwal->update($data);

        return $jadwal->load('kelas', 'mapel', 'guru');
    }

    public function destroy(Jadwal $jadwal)
    {
        $jadwal->delete();

        return response()->json(['message' => 'Jadwal dihapus.']);
    }

    private function ensureNoOverlap(array $data, ?int $ignoreId = null): void
    {
        $overlap = Jadwal::where('kelas_id', $data['kelas_id'])
            ->where('hari', $data['hari'])
            ->where('jam_mulai', '<', $data['jam_selesai'])
            ->where('jam_selesai', '>', $data['jam_mulai'])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        if ($overlap) {
            abort(422, 'Jadwal kelas ini sudah terisi pada jam tersebut.');
        }
    }
}
