<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    public function index()
    {
        return Kelas::with('waliKelas')
            ->withCount('siswas')
            ->orderBy('tingkat')
            ->orderBy('nama')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tingkat' => ['required', 'in:7,8,9'],
            'nama' => ['required', 'string', 'max:1'],
            'wali_kelas_id' => ['nullable', 'exists:gurus,id'],
        ]);

        $this->validateUnique($data);

        return response()->json(Kelas::create($data)->load('waliKelas'), 201);
    }

    public function show(Kelas $kelas)
    {
        return $kelas->load('waliKelas', 'siswas');
    }

    public function update(Request $request, Kelas $kelas)
    {
        $data = $request->validate([
            'tingkat' => ['required', 'in:7,8,9'],
            'nama' => ['required', 'string', 'max:1'],
            'wali_kelas_id' => ['nullable', 'exists:gurus,id'],
        ]);

        $this->validateUnique($data, $kelas->id);

        $kelas->update($data);

        return $kelas->load('waliKelas');
    }

    public function destroy(Kelas $kelas)
    {
        if ($kelas->siswas()->exists()) {
            return response()->json(['message' => 'Kelas masih memiliki siswa, pindahkan siswa terlebih dahulu.'], 422);
        }

        $kelas->delete();

        return response()->json(['message' => 'Kelas dihapus.']);
    }

    private function validateUnique(array $data, ?int $ignoreId = null): void
    {
        $query = Kelas::where('tingkat', $data['tingkat'])->where('nama', $data['nama']);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        if ($query->exists()) {
            abort(422, 'Kelas '.$data['tingkat'].$data['nama'].' sudah ada.');
        }
    }
}
