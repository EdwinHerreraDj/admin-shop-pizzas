<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use App\Models\Ingrediente;
use App\Models\ArticuloIngrediente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArticuloIngredienteController extends Controller
{
    /**
     * Vista simple: asignados + disponibles
     * (para UI tipo “listas base / extra”)
     */
    public function index(Articulo $articulo)
    {
        $asignados = ArticuloIngrediente::with('ingrediente.categoria')
            ->where('articulo_id', $articulo->id)
            ->get();

        $ingredientesDisponibles = Ingrediente::with('categoria')
            ->where('activo', true)
            ->whereNotIn('id', $asignados->pluck('ingrediente_id'))
            ->get();

        return response()->json([
            'articulo' => $articulo,
            'asignados' => $asignados,
            'disponibles' => $ingredientesDisponibles,
        ]);
    }

    /**
     * Acción UNitaria:
     * - pasar a base
     * - pasar a extra
     * - crear relación
     */
    public function store(Request $request, Articulo $articulo)
    {
        $data = $request->validate([
            'ingrediente_id' => ['required', 'exists:ingredientes,id'],
            'modo' => ['required', 'in:base,extra'],
            'obligatorio' => ['nullable', 'boolean'],
            'incluido_por_defecto' => ['nullable', 'boolean'],
            'max_cantidad' => ['nullable', 'integer', 'min:1'],
        ]);

        ArticuloIngrediente::updateOrCreate(
            [
                'articulo_id' => $articulo->id,
                'ingrediente_id' => $data['ingrediente_id'],
            ],
            [
                'modo' => $data['modo'],

                // Solo aplica a BASE
                'obligatorio' => $data['modo'] === 'base'
                    ? (bool) ($data['obligatorio'] ?? false)
                    : false,

                'incluido_por_defecto' => $data['modo'] === 'base'
                    ? (bool) ($data['incluido_por_defecto'] ?? true)
                    : false,

                // Solo aplica a EXTRA
                'max_cantidad' => $data['modo'] === 'extra'
                    ? ($data['max_cantidad'] ?? 1)
                    : null,
            ]
        );

        return response()->noContent();
    }

    /**
     * Eliminar relación (volver a “ninguno”)
     */
    public function destroy(Articulo $articulo, Ingrediente $ingrediente)
    {
        ArticuloIngrediente::where([
            'articulo_id' => $articulo->id,
            'ingrediente_id' => $ingrediente->id,
        ])->delete();

        return response()->noContent();
    }

    /**
     * Config completa (para UI avanzada / tienda)
     * Todos los ingredientes + su estado
     */
    public function ingredientesConfig(Articulo $articulo)
    {
        // Ingredientes compatibles con el tipo de producto del artículo
        $ingredientes = Ingrediente::with('categoria')
            ->where('activo', true)
            ->whereHas('precios', function ($q) use ($articulo) {
                $q->where('tipo_producto_id', $articulo->tipo_producto_id);
            })
            ->get();

        // Relaciones actuales del artículo
        $relaciones = ArticuloIngrediente::where('articulo_id', $articulo->id)
            ->get()
            ->keyBy('ingrediente_id');

        $resultado = [];

        foreach ($ingredientes as $ingrediente) {
            $categoria = $ingrediente->categoria?->nombre ?? 'Sin categoría';
            $pivot = $relaciones->get($ingrediente->id);

            $resultado[$categoria][] = [
                'ingrediente_id' => $ingrediente->id,
                'nombre' => $ingrediente->nombre,
                'estado' => $pivot?->modo ?? 'ninguno',
                'obligatorio' => (bool) ($pivot?->obligatorio ?? false),
                'incluido_por_defecto' => (bool) ($pivot?->incluido_por_defecto ?? false),
                'max_cantidad' => $pivot?->max_cantidad,
            ];
        }

        return response()->json([
            'articulo' => [
                'id' => $articulo->id,
                'nombre' => $articulo->nombre,
            ],
            'ingredientes' => $resultado,
        ]);
    }


    /**
     * Sincronización MASIVA
     * (guardar estado final completo)
     */
    public function syncIngredientes(Request $request, Articulo $articulo)
    {
        $data = $request->validate([
            'ingredientes' => ['required', 'array'],
            'ingredientes.*.ingrediente_id' => ['required', 'exists:ingredientes,id'],
            'ingredientes.*.estado' => ['required', 'in:base,extra,ninguno'],
            'ingredientes.*.obligatorio' => ['nullable', 'boolean'],
            'ingredientes.*.incluido_por_defecto' => ['nullable', 'boolean'],
            'ingredientes.*.max_cantidad' => ['nullable', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($data, $articulo) {
            foreach ($data['ingredientes'] as $item) {

                // Ninguno = eliminar relación
                if ($item['estado'] === 'ninguno') {
                    ArticuloIngrediente::where([
                        'articulo_id' => $articulo->id,
                        'ingrediente_id' => $item['ingrediente_id'],
                    ])->delete();
                    continue;
                }

                ArticuloIngrediente::updateOrCreate(
                    [
                        'articulo_id' => $articulo->id,
                        'ingrediente_id' => $item['ingrediente_id'],
                    ],
                    [
                        'modo' => $item['estado'],
                        'obligatorio' => $item['estado'] === 'base'
                            ? (bool) ($item['obligatorio'] ?? false)
                            : false,
                        'incluido_por_defecto' => $item['estado'] === 'base'
                            ? (bool) ($item['incluido_por_defecto'] ?? true)
                            : false,
                        'max_cantidad' => $item['estado'] === 'extra'
                            ? ($item['max_cantidad'] ?? 1)
                            : null,
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Ingredientes sincronizados correctamente',
        ]);
    }
}
