<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PizzasExistentesController extends Controller
{
    /**
     * Pizzas existentes para el selector de mitades.
     * Devuelve solo pizzas publicadas (tipo_producto_id = 1),
     * excluyendo la plantilla (es_plantilla = 1).
     *
     * GET /api/shop/pizzas-existentes
     */
    public function pizzasExistentes(Request $request)
    {
        $perPage = $request->integer('per_page', 20);
        $now = Carbon::now()->format('H:i');

        $pizzas = Articulo::query()
            ->where('publicado', true)
            ->where('tipo_producto_id', 1)
            ->where('es_plantilla', false)
            // Filtro horario
            ->where(function ($q) use ($now) {
                $q->whereNull('hora_inicio_venta')
                    ->orWhereNull('hora_fin_venta')
                    ->orWhere(function ($sub) use ($now) {
                        $sub->where('hora_inicio_venta', '<=', $now)
                            ->where('hora_fin_venta', '>=', $now);
                    });
            })
            ->with([
                'precios.tamano:id,nombre',
            ])
            ->orderBy('orden')
            ->paginate($perPage);

        // Transformar para devolver solo lo necesario
        $pizzas->getCollection()->transform(function ($articulo) {
            return [
                'id'               => $articulo->id,
                'nombre'           => $articulo->nombre,
                'imagen'           => $articulo->imagen_url,
                'tipo_producto_id' => $articulo->tipo_producto_id,
                'tamanos'          => $articulo->precios->map(function ($p) {
                    return [
                        'tamano_id' => $p->tamano->id,
                        'nombre'    => $p->tamano->nombre,
                        'precio'    => (float) $p->precio,
                    ];
                })->values(),
            ];
        });

        return response()->json($pizzas);
    }
}
