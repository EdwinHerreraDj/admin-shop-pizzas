<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use Illuminate\Http\Request;
use App\Http\Resources\ArticuloResource;
use Carbon\Carbon;

class ArticuloPublicController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 8);
        $now = Carbon::now()->format('H:i:s');

        $query = Articulo::query()
            ->where('publicado', true)

            // FILTRO HORARIO
            ->where(function ($q) use ($now) {

                $q->where(function ($sub) {
                    $sub->whereNull('hora_inicio_venta')
                        ->whereNull('hora_fin_venta');
                })

                    ->orWhere(function ($sub) use ($now) {
                        $sub->whereNotNull('hora_inicio_venta')
                            ->whereNotNull('hora_fin_venta')
                            ->where('hora_inicio_venta', '<=', $now)
                            ->where('hora_fin_venta', '>=', $now);
                    });
            })

            ->with([
                'tipoProducto:id,nombre',
                'categorias:id,nombre,es_comida',
                'precios.tamano:id,nombre'
            ]);

        // 🔎 Búsqueda
        if ($request->filled('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        // 🏷️ Filtro por categoría
        if ($request->filled('categoria_id')) {

            $categoriaId = $request->categoria_id;

            $query->join('articulo_categoria as ac', function ($join) use ($categoriaId) {
                $join->on('articulos.id', '=', 'ac.articulo_id')
                    ->where('ac.categoria_articulo_id', $categoriaId);
            });

            $query->select('articulos.*');

            $query->orderBy('ac.orden');
        } else {

            $query->orderBy('articulos.orden');
        }

        return ArticuloResource::collection(
            $query->paginate($perPage)
        );
    }

    public function show(Articulo $articulo)
    {
        $now = Carbon::now()->format('H:i:s');

        if (
            $articulo->hora_inicio_venta &&
            $articulo->hora_fin_venta
        ) {
            if (
                $now < $articulo->hora_inicio_venta ||
                $now > $articulo->hora_fin_venta
            ) {
                abort(404);
            }
        }
        $articulo->load([
            'precios.tamano:id,nombre',
            'ingredientes.precios',
            'ingredientes' => function ($q) {
                $q->withPivot([
                    'modo',
                    'incluido_por_defecto',
                    'obligatorio',
                    'max_cantidad'
                ]);
            },
            'ingredientes.categoria:id,nombre',
        ]);

        $tipoProductoId = $articulo->tipo_producto_id;

        // 🔹 Tamaños válidos del artículo
        $tamanoIds = $articulo->precios->pluck('tamano_id')->toArray();

        $tamanos = $articulo->precios->map(function ($p) {
            return [
                'id' => $p->tamano->id,
                'nombre' => $p->tamano->nombre,
                'precio' => (float) $p->precio,
            ];
        })->values();

        // 🔹 Agrupar ingredientes por categoría
        $ingredientes = [];

        foreach ($articulo->ingredientes as $ingrediente) {

            $categoria = $ingrediente->categoria->nombre ?? 'Otros';

            // 🔥 FILTRADO REAL DE PRECIOS
            $precioPorTamano = $ingrediente->precios
                ->where('tipo_producto_id', $tipoProductoId)
                ->whereIn('tamano_id', $tamanoIds)
                ->mapWithKeys(function ($p) {
                    return [
                        $p->tamano_id => (float) $p->precio
                    ];
                });

            $ingredientes[$categoria][] = [
                'id' => $ingrediente->id,
                'nombre' => $ingrediente->nombre,
                'modo' => $ingrediente->pivot->modo,
                'incluido' => (bool) $ingrediente->pivot->incluido_por_defecto,
                'obligatorio' => (bool) $ingrediente->pivot->obligatorio,
                'max_cantidad' => $ingrediente->pivot->max_cantidad,
                'precio_por_tamano' => $precioPorTamano,
            ];
        }

        return response()->json([
            'id' => $articulo->id,
            'tipo_producto_id' => $articulo->tipo_producto_id,
            'nombre' => $articulo->nombre,
            'descripcion' => $articulo->descripcion,
            'imagen' => $articulo->imagen_url,
            'personalizable' => $articulo->personalizable,
            'tamanos' => $tamanos,
            'ingredientes' => $ingredientes,
        ]);
    }
}
