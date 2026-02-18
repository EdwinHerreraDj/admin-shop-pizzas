<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ZonaEnvio;
use Illuminate\Http\Request;

class ZonaEnvioController extends Controller
{
    public function index(Request $request)
    {
        $query = ZonaEnvio::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('codigo_postal', 'like', "%{$request->search}%")
                  ->orWhere('barrio', 'like', "%{$request->search}%");
            });
        }

        return response()->json(
            $query->orderBy('codigo_postal')
                  ->orderBy('barrio')
                  ->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo_postal' => 'required|string|max:10',
            'barrio' => 'required|string|max:255',
            'recargo' => 'required|numeric|min:0',
            'activo' => 'required|boolean',
        ]);

        $zona = ZonaEnvio::create($validated);

        return response()->json($zona, 201);
    }

    public function update(Request $request, ZonaEnvio $zona)
    {
        $validated = $request->validate([
            'codigo_postal' => 'required|string|max:10',
            'barrio' => 'required|string|max:255',
            'recargo' => 'required|numeric|min:0',
            'activo' => 'required|boolean',
        ]);

        $zona->update($validated);

        return response()->json($zona);
    }

    public function destroy(ZonaEnvio $zona)
    {
        $zona->delete();

        return response()->json(['message' => 'Zona eliminada']);
    }
}
