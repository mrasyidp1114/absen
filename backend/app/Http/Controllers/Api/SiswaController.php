<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::with('kelas')->orderBy('nama');

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->integer('kelas_id'));
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nisn' => ['required', 'string', 'max:20', 'unique:siswas,nisn'],
            'nama' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'kelas_id' => ['required', 'exists:kelas,id'],
            'email' => ['nullable', 'email', 'unique:users,email'],
        ]);

        $siswa = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['nama'],
                'username' => $data['nisn'],
                'email' => $data['email'] ?? $data['nisn'].'@sekolah.test',
                'password' => Hash::make($data['nisn']),
                'role' => 'siswa',
            ]);

            return Siswa::create([
                'user_id' => $user->id,
                'nisn' => $data['nisn'],
                'nama' => $data['nama'],
                'jenis_kelamin' => $data['jenis_kelamin'],
                'kelas_id' => $data['kelas_id'],
            ]);
        });

        return response()->json($siswa->load('kelas'), 201);
    }

    public function show(Siswa $siswa)
    {
        return $siswa->load('kelas');
    }

    public function update(Request $request, Siswa $siswa)
    {
        $data = $request->validate([
            'nisn' => ['required', 'string', 'max:20', 'unique:siswas,nisn,'.$siswa->id],
            'nama' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'kelas_id' => ['required', 'exists:kelas,id'],
        ]);

        DB::transaction(function () use ($siswa, $data) {
            $siswa->update($data);
            $siswa->user->update([
                'name' => $data['nama'],
                'username' => $data['nisn'],
            ]);
        });

        return $siswa->load('kelas');
    }

    public function destroy(Siswa $siswa)
    {
        $siswa->user->delete();

        return response()->json(['message' => 'Siswa dihapus.']);
    }
}
