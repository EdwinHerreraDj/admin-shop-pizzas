<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use App\Models\Categoria as CategoriaModel;
use App\Models\Ingrediente;

class ArticuloController extends Controller
{
    /* Metodo privado para la estructura de los datos */
    private function formatoArticulo($articulo)
    {
        return [
            'id' => $articulo->id,
            'nombre' => $articulo->nombre,
            'descripcion' => $articulo->descripcion,
            'categoria' => $articulo->categoria->nombre ?? 'Sin categoría',
            'tipo_producto' => $articulo->tipoProducto->nombre ?? 'Sin tipo',
            'imagen' => $articulo->imagen_url
                ? asset('storage/' . $articulo->imagen_url)
                : null,
            'precios' => [
                'pequena' => $articulo->precio_pequena,
                'mediana' => $articulo->precio_mediana,
                'grande' => $articulo->precio_grande,
                'unico' => $articulo->precio_unico,
            ],
            'personalizable' => $articulo->es_personalizable,
            'ingredientes' => $articulo->ingredientes->map(fn($ing) => [
                'id' => $ing->id,
                'nombre' => $ing->nombre,
                'categoria' => $ing->categoria,
            ]),
        ];
    }

    // Lista de todos los artículos
    public function index()
    {
        $articulos = Articulo::with(['categoria', 'tipoProducto', 'ingredientes'])
            ->where('publicado', true)
            ->paginate(12)
            ->through(fn($a) => $this->formatoArticulo($a));

        return response()->json($articulos);
    }

    // Artículos filtrados por categoría
    public function porCategoria($id)
    {
        $articulos = Articulo::with(['categoria', 'tipoProducto', 'ingredientes'])
            ->where('categoria_id', $id)
            ->where('publicado', true)
            ->paginate(12)
            ->through(fn($a) => $this->formatoArticulo($a));

        return response()->json($articulos);
    }

    // Artículo individual (para mostrar detalles)
    public function show($id)
    {
        $articulo = Articulo::with(['categoria', 'tipoProducto', 'ingredientes'])
            ->findOrFail($id);

        return response()->json([
            'id' => $articulo->id,
            'nombre' => $articulo->nombre,
            'descripcion' => $articulo->descripcion,
            'categoria' => $articulo->categoria->nombre ?? 'Sin categoría',
            'tipo_producto' => $articulo->tipoProducto->nombre ?? 'Sin tipo',
            'imagen' => $articulo->imagen_url ? asset('storage/' . $articulo->imagen_url) : null,
            'precios' => [
                'pequena' => $articulo->precio_pequena,
                'mediana' => $articulo->precio_mediana,
                'grande' => $articulo->precio_grande,
                'unico' => $articulo->precio_unico,
            ],
            'personalizable' => $articulo->es_personalizable,
            'ingredientes' => $articulo->ingredientes->map(fn($ing) => [
                'id' => $ing->id,
                'nombre' => $ing->nombre,
                'categoria' => $ing->categoria,
            ]),
        ]);
    }

    // Lista de categorías
    public function categorias()
    {
        $categorias = CategoriaModel::select('id', 'nombre')->get();

        return response()->json($categorias);
    }

    // Ingredientes de un artículo (incluidos y extras con precios)
    public function ingredientesConPrecios($id)
    {
        $articulo = Articulo::with(['ingredientes.tiposProductos', 'tipoProducto'])
            ->findOrFail($id);

        $tipoProductoId = $articulo->tipo_producto_id;

        // IDs de ingredientes incluidos de base
        $asignadosIds = $articulo->ingredientes->pluck('id')->toArray();

        // Ingredientes con precios extra válidos para el tipo de producto
        $ingredientes = Ingrediente::query()
            ->whereHas('tiposProductos', function ($q) use ($tipoProductoId) {
                $q->where('tipos_productos.id', $tipoProductoId)
                    ->where(function ($qq) {
                        $qq->where('ingrediente_tipo_producto.precio_extra_pequena', '>', 0)
                            ->orWhere('ingrediente_tipo_producto.precio_extra_mediana', '>', 0)
                            ->orWhere('ingrediente_tipo_producto.precio_extra_grande', '>', 0)
                            ->orWhere('ingrediente_tipo_producto.precio_extra_unico', '>', 0);
                    });
            })
            ->with(['tiposProductos' => function ($q) use ($tipoProductoId) {
                $q->where('tipos_productos.id', $tipoProductoId);
            }])
            ->orderByRaw('categoria IS NULL, categoria ASC')
            ->orderBy('nombre')
            ->get();

        // Agrupar por categoría y marcar si está incluido
        $ingredientesAgrupados = $ingredientes
            ->groupBy(fn($i) => $i->categoria ?? 'Otros')
            ->map(function ($grupo) use ($asignadosIds) {
                return $grupo->map(function ($i) use ($asignadosIds) {
                    $tipo = $i->tiposProductos->first();

                    return [
                        'id' => $i->id,
                        'nombre' => $i->nombre,
                        'incluido' => in_array($i->id, $asignadosIds),
                        'precios' => $tipo ? [
                            'pequena' => (float) $tipo->pivot->precio_extra_pequena,
                            'mediana' => (float) $tipo->pivot->precio_extra_mediana,
                            'grande' => (float) $tipo->pivot->precio_extra_grande,
                            'unico' => (float) $tipo->pivot->precio_extra_unico,
                        ] : null,
                    ];
                })->values();
            });

        // Respuesta final
        return response()->json([
            'articulo' => [
                'id' => $articulo->id,
                'nombre' => $articulo->nombre,
                'descripcion' => $articulo->descripcion,
                'tipoProducto' => $articulo->tipoProducto->nombre ?? 'Sin tipo',
                'personalizable' => $articulo->es_personalizable,
                'imagen' => $articulo->imagen_url
                    ? asset('storage/' . $articulo->imagen_url)
                    : null,
                'precio_pequena' => (float) $articulo->precio_pequena,
                'precio_mediana' => (float) $articulo->precio_mediana,
                'precio_grande' => (float) $articulo->precio_grande,
                'precio_unico' => (float) $articulo->precio_unico,
            ],
            'ingredientes' => $ingredientesAgrupados,
        ]);
    }

    // Ingredientes base para pizzas con precios para crear una pizza desde cero

    public function ingredientesBase()
    {
        // ID del tipo producto Pizza
        $tipoProductoPizzaId = 1;

        $ingredientes = Ingrediente::query()
            ->whereHas('tiposProductos', function ($q) use ($tipoProductoPizzaId) {
                $q->where('tipos_productos.id', $tipoProductoPizzaId)
                    ->where(function ($qq) {
                        $qq->where('ingrediente_tipo_producto.precio_extra_mediana', '>', 0)
                            ->orWhere('ingrediente_tipo_producto.precio_extra_grande', '>', 0);
                    });
            })
            ->with(['tiposProductos' => function ($q) use ($tipoProductoPizzaId) {
                $q->where('tipos_productos.id', $tipoProductoPizzaId);
            }])
            ->orderByRaw('categoria IS NULL, categoria ASC')
            ->orderBy('nombre')
            ->get();

        $ingredientesAgrupados = $ingredientes
            ->groupBy(fn($i) => $i->categoria ?? 'Otros')
            ->map(function ($grupo) {
                return $grupo->map(function ($i) {
                    $tipo = $i->tiposProductos->first();

                    return [
                        'id' => $i->id,
                        'nombre' => $i->nombre,
                        'precios' => [
                            'mediana' => (float) $tipo->pivot->precio_extra_mediana,
                            'grande' => (float) $tipo->pivot->precio_extra_grande,
                        ],
                    ];
                })->values();
            });

        return response()->json($ingredientesAgrupados);
    }
}
