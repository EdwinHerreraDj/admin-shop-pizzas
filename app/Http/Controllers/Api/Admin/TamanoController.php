<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tamano;
use Illuminate\Http\Request;

class TamanoController extends Controller
{
    public function index()
    {
        return Tamano::orderBy('orden')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:50'],
            'orden'  => ['required', 'integer', 'min:1'],
        ]);

        $tamano = Tamano::create($data);

        return response()->json($tamano, 201);
    }

    public function show(Tamano $tamano)
    {
        return $tamano;
    }

    public function update(Request $request, Tamano $tamano)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:50'],
            'orden'  => ['required', 'integer', 'min:1'],
        ]);

        $tamano->update($data);

        return $tamano;
    }

    public function destroy(Tamano $tamano)
    {
        // No borrar si está en uso
        if (
            $tamano->articuloPrecios()->exists() ||
            $tamano->ingredientePrecios()->exists()
        ) {
            return response()->json([
                'message' => 'No se puede eliminar: el tamaño está en uso.'
            ], 422);
        }

        $tamano->delete();

        return response()->noContent();
    }
}
