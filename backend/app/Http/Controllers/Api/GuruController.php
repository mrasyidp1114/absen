<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GuruController extends Controller
{
    public function index()
    {
        return Guru::orderBy('nama')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nip' => ['required', 'string', 'max:30', 'unique:gurus,nip'],
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email'],
        ]);

        $guru = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['nama'],
                'username' => $data['nip'],
                'email' => $data['email'] ?? $data['nip'].'@sekolah.test',
                'password' => Hash::make($data['nip']),
                'role' => 'guru',
            ]);

            return Guru::create([
                'user_id' => $user->id,
                'nip' => $data['nip'],
                'nama' => $data['nama'],
            ]);
        });

        return response()->json($guru, 201);
    }

    public function show(Guru $guru)
    {
        return $guru->load('jadwals.kelas', 'jadwals.mapel');
    }

    public function update(Request $request, Guru $guru)
    {
        $data = $request->validate([
            'nip' => ['required', 'string', 'max:30', 'unique:gurus,nip,'.$guru->id],
            'nama' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($guru, $data) {
            $guru->update($data);
            $guru->user->update([
                'name' => $data['nama'],
                'username' => $data['nip'],
            ]);
        });

        return $guru;
    }

    public function destroy(Guru $guru)
    {
        if ($guru->jadwals()->exists()) {
            return response()->json(['message' => 'Guru masih memiliki jadwal mengajar, hapus jadwal terlebih dahulu.'], 422);
        }

        $guru->user->delete();

        return response()->json(['message' => 'Guru dihapus.']);
    }
}
