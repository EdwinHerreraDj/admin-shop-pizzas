<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Articulo;

class PizzaPlantillaController extends Controller
{
    public function show()
    {
        $articulo = Articulo::query()
            ->where('es_plantilla', true)
            ->where('personalizable', true)
            ->where('publicado', true)
            ->orderByDesc('id')
            ->firstOrFail();

        $articulo->load([
            'precios.tamano:id,nombre',
            'ingredientes' => function ($q) {
                $q->withPivot([
                    'modo',
                    'incluido_por_defecto',
                    'obligatorio',
                    'max_cantidad'
                ]);
            },
            'ingredientes.categoria:id,nombre',
            'ingredientes.precios'
        ]);

        /*
        |--------------------------------------------------------------------------
        | TAMAÑOS VÁLIDOS PARA ESTA PIZZA
        |--------------------------------------------------------------------------
        */
        $tamanos = $articulo->precios->map(function ($p) {
            return [
                'id' => (int) $p->tamano->id,
                'nombre' => $p->tamano->nombre,
                'precio' => (float) $p->precio,
            ];
        })->values();

        $validTamanoIds = $tamanos->pluck('id')->toArray();

        /*
        |--------------------------------------------------------------------------
        | INGREDIENTES AGRUPADOS Y FILTRADOS
        |--------------------------------------------------------------------------
        */
        $ingredientes = [];

        foreach ($articulo->ingredientes as $ingrediente) {

            $categoria = $ingrediente->categoria->nombre ?? 'Otros';

            $preciosFiltrados = $ingrediente->precios
                ->whereIn('tamano_id', $validTamanoIds)
                ->unique('tamano_id') // elimina duplicados silenciosamente
                ->map(function ($pp) {
                    return [
                        'tamano_id' => (int) $pp->tamano_id,
                        'precio' => (float) $pp->precio,
                    ];
                })
                ->values();

            $ingredientes[$categoria][] = [
                'id' => (int) $ingrediente->id,
                'nombre' => $ingrediente->nombre,
                'modo' => $ingrediente->pivot->modo,
                'incluido' => (bool) $ingrediente->pivot->incluido_por_defecto,
                'obligatorio' => (bool) $ingrediente->pivot->obligatorio,
                'max_cantidad' => $ingrediente->pivot->max_cantidad,
                'precios' => $preciosFiltrados,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA FINAL
        |--------------------------------------------------------------------------
        */
        return response()->json([
            'id' => (int) $articulo->id,
            'nombre' => $articulo->nombre,
            'descripcion' => $articulo->descripcion,
            'imagen' => $articulo->imagen_url,
            'personalizable' => (bool) $articulo->personalizable,
            'tipo_producto_id' => (int) $articulo->tipo_producto_id,
            'tamanos' => $tamanos,
            'ingredientes' => $ingredientes,
        ]);
    }
}
