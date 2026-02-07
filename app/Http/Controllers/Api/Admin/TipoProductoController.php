<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TipoProducto;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TipoProductoController extends Controller
{
    public function index()
    {
        return TipoProducto::query()
            ->orderBy('id')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'usa_tamanos' => ['required', 'boolean'],
        ]);

        $tipo = TipoProducto::create($data);

        return response()->json($tipo, 201);
    }

    public function show(TipoProducto $tipos_producto)
    {
        return $tipos_producto;
    }

    public function update(Request $request, TipoProducto $tipos_producto)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'usa_tamanos' => ['required', 'boolean'],
        ]);

        $tipos_producto->update($data);

        return $tipos_producto;
    }

    public function destroy(TipoProducto $tipos_producto)
    {
        // Si tiene artículos, NO borrar.
        if ($tipos_producto->articulos()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar: tiene artículos asociados.'
            ], 422);
        }

        $tipos_producto->delete();

        return response()->noContent();
    }
}
