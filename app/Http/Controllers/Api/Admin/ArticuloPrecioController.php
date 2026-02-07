<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArticuloPrecio;
use Illuminate\Http\Request;

class ArticuloPrecioController extends Controller
{
    public function index()
    {
        return ArticuloPrecio::with([
            'articulo:id,nombre',
            'tamano:id,nombre',
        ])->orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'articulo_id' => ['required', 'exists:articulos,id'],
            'tamano_id'   => ['required', 'exists:tamanos,id'],
            'precio'      => ['required', 'numeric', 'min:0'],
        ]);

        $exists = ArticuloPrecio::where([
            'articulo_id' => $data['articulo_id'],
            'tamano_id'   => $data['tamano_id'],
        ])->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ya existe un precio para este tamaño.'
            ], 422);
        }

        return ArticuloPrecio::create($data);
    }

    public function show(ArticuloPrecio $articulo_precio)
    {
        return $articulo_precio->load(['articulo', 'tamano']);
    }

    public function update(Request $request, ArticuloPrecio $articulo_precio)
    {
        $data = $request->validate([
            'precio' => ['required', 'numeric', 'min:0'],
        ]);

        $articulo_precio->update($data);

        return $articulo_precio->load(['articulo', 'tamano']);
    }

    public function destroy(ArticuloPrecio $articulo_precio)
    {
        $articulo_precio->delete();
        return response()->noContent();
    }
}
