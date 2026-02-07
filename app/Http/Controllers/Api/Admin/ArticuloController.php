<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArticuloController extends Controller
{
    public function index()
    {
        return Articulo::query()
            ->with([
                'tipoProducto:id,nombre',
                'categorias:id,nombre'
            ])
            ->withCount([
                'ingredientes as ingredientes_base_count' => function ($q) {
                    $q->where('articulo_ingredientes.modo', 'base');
                }
            ])
            ->orderBy('orden')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'tipo_producto_id' => ['nullable', 'exists:tipos_producto,id'],
            'personalizable' => ['nullable', 'boolean'],
            'publicado' => ['nullable', 'boolean'],
            'orden' => ['nullable', 'integer', 'min:1'],
            'hora_inicio_venta' => ['nullable', 'date_format:H:i'],
            'hora_fin_venta' => ['nullable', 'date_format:H:i'],
            'imagen' => ['nullable', 'image', 'max:2048'],
        ]);

        // Defaults seguros
        $data['personalizable'] = $data['personalizable'] ?? false;
        $data['publicado'] = $data['publicado'] ?? false;

        if (!isset($data['orden'])) {
            $maxOrden = Articulo::max('orden');
            $data['orden'] = $maxOrden ? $maxOrden + 1 : 1;
        }

        if ($request->hasFile('imagen')) {
            $data['imagen'] = $request->file('imagen')->store('articulos', 'public');
        }

        return Articulo::create($data);
    }




    public function show(Articulo $articulo)
    {
        return $articulo->load('tipoProducto', 'categorias');
    }

    /* UPDATE */

    public function update(Request $request, Articulo $articulo)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'tipo_producto_id' => ['nullable', 'exists:tipos_producto,id'],
            'personalizable' => ['nullable', 'boolean'],
            'publicado' => ['nullable', 'boolean'],
            'orden' => ['nullable', 'integer', 'min:1'],
            'hora_inicio_venta' => ['nullable', 'date_format:H:i'],
            'hora_fin_venta' => ['nullable', 'date_format:H:i'],
            'imagen' => ['nullable', 'image', 'max:2048'],
        ]);

        // Defaults si no vienen
        $data['personalizable'] = $data['personalizable'] ?? $articulo->personalizable;
        $data['publicado'] = $data['publicado'] ?? $articulo->publicado;
        $data['orden'] = $data['orden'] ?? $articulo->orden;

        // Coherencia de negocio
        if (!$data['personalizable']) {
            $data['tipo_producto_id'] = null;
        }

        if ($request->hasFile('imagen')) {
            if ($articulo->imagen) {
                Storage::disk('public')->delete($articulo->imagen);
            }

            $data['imagen'] = $request->file('imagen')
                ->store('articulos', 'public');
        }

        $articulo->update($data);

        return $articulo->load('tipoProducto', 'categorias');
    }


    public function destroy(Articulo $articulo)
    {
        if (
            $articulo->precios()->exists() ||
            $articulo->ingredientes()->exists()
        ) {
            return response()->json([
                'message' => 'No se puede eliminar: el artículo tiene precios o ingredientes asignados.'
            ], 422);
        }

        if ($articulo->imagen) {
            Storage::disk('public')->delete($articulo->imagen);
        }

        $articulo->delete();

        return response()->noContent();
    }
}
