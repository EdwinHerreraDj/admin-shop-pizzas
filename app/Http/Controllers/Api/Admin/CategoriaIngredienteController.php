<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoriaIngrediente;
use Illuminate\Http\Request;

class CategoriaIngredienteController extends Controller
{
    public function index()
    {
        return CategoriaIngrediente::orderBy('orden')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'orden'  => ['required', 'integer', 'min:1'],
        ]);

        return CategoriaIngrediente::create($data);
    }

    public function show(CategoriaIngrediente $categorias_ingrediente)
    {
        return $categorias_ingrediente;
    }

    public function update(Request $request, CategoriaIngrediente $categorias_ingrediente)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'orden'  => ['required', 'integer', 'min:1'],
        ]);

        $categorias_ingrediente->update($data);

        return $categorias_ingrediente;
    }

    public function destroy(CategoriaIngrediente $categorias_ingrediente)
    {
        if ($categorias_ingrediente->ingredientes()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar: tiene ingredientes asociados.'
            ], 422);
        }

        $categorias_ingrediente->delete();

        return response()->noContent();
    }
}
