<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = \App\Models\User::where('username', $credentials['username'])->first();

        if (! $user || ! Auth::getProvider()->validateCredentials($user, ['password' => $credentials['password']])) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    private function formatUser(\App\Models\User $user): array
    {
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'role' => $user->role,
        ];

        if ($user->isGuru()) {
            $guru = $user->guru;
            $data['guru'] = $guru ? ['id' => $guru->id, 'nip' => $guru->nip, 'nama' => $guru->nama] : null;
        }

        if ($user->isSiswa()) {
            $siswa = $user->siswa()->with('kelas')->first();
            $data['siswa'] = $siswa ? [
                'id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->nama,
                'kelas_id' => $siswa->kelas_id,
                'kelas' => $siswa->kelas?->nama_lengkap,
            ] : null;
        }

        return $data;
    }
}
