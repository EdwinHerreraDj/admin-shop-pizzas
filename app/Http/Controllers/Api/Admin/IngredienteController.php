<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingrediente;
use App\Models\CategoriaIngrediente;
use Illuminate\Http\Request;

class IngredienteController extends Controller
{
    public function index()
    {
        return Ingrediente::with([
            'categoria',
            'precios.tipoProducto',
            'precios.tamano',
        ])
            ->orderBy('id')
            ->get();
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'categoria_id' => ['required', 'exists:categorias_ingredientes,id'],
            'activo' => ['required', 'boolean'],
        ]);

        return Ingrediente::create($data);
    }

    public function show(Ingrediente $ingrediente)
    {
        return $ingrediente->load('categoria');
    }

    public function update(Request $request, Ingrediente $ingrediente)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'categoria_id' => ['required', 'exists:categorias_ingredientes,id'],
            'activo' => ['required', 'boolean'],
        ]);

        $ingrediente->update($data);

        return $ingrediente->load('categoria');
    }

    public function destroy(Ingrediente $ingrediente)
    {
        // No eliminar si está asignado a artículos
        if ($ingrediente->articuloIngredientes()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar: el ingrediente está asignado a artículos.'
            ], 422);
        }

        $ingrediente->delete();

        return response()->noContent();
    }
}
