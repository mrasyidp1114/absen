<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mapel;
use Illuminate\Http\Request;

class MapelController extends Controller
{
    public function index()
    {
        return Mapel::orderBy('nama_mapel')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'unique:mapels,kode'],
            'nama_mapel' => ['required', 'string', 'max:255'],
        ]);

        return response()->json(Mapel::create($data), 201);
    }

    public function show(Mapel $mapel)
    {
        return $mapel;
    }

    public function update(Request $request, Mapel $mapel)
    {
        $data = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'unique:mapels,kode,'.$mapel->id],
            'nama_mapel' => ['required', 'string', 'max:255'],
        ]);

        $mapel->update($data);

        return $mapel;
    }

    public function destroy(Mapel $mapel)
    {
        $mapel->delete();

        return response()->json(['message' => 'Mapel dihapus.']);
    }
}
