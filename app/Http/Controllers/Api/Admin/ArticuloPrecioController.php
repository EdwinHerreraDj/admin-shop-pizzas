<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use App\Models\Tamano;
use Illuminate\Http\Request;

class ArticuloPrecioController extends Controller
{
    /**
     * Obtener tamaños permitidos y precios actuales del artículo
     */
    public function index(Articulo $articulo)
    {
        // Filtrar tamaños según tipo de artículo
        if ($articulo->personalizable) {
            $tamanos = Tamano::where('nombre', '!=', 'Único')
                ->orderBy('orden')
                ->get();
        } else {
            $tamanos = Tamano::where('nombre', 'Único')
                ->orderBy('orden')
                ->get();
        }

        $precios = $articulo->precios()
            ->select('tamano_id', 'precio')
            ->get();
            

        return response()->json([
            'tamanos' => $tamanos,
            'precios' => $precios,
        ]);
    }

    /**
     * Reemplazar todos los precios del artículo
     */
    public function update(Request $request, Articulo $articulo)
    {
        $data = $request->validate([
            'precios' => ['required', 'array'],
            'precios.*.tamano_id' => ['required', 'exists:tamanos,id'],
            'precios.*.precio' => ['required', 'numeric', 'min:0'],
        ]);

        // Obtener tamaños permitidos según tipo de artículo
        if ($articulo->personalizable) {
            $tamanosPermitidos = Tamano::where('nombre', '!=', 'Único')
                ->pluck('id')
                ->toArray();
        } else {
            $tamanosPermitidos = Tamano::where('nombre', 'Único')
                ->pluck('id')
                ->toArray();
        }

        // Validar que solo se envíen tamaños permitidos
        foreach ($data['precios'] as $precio) {
            if (!in_array($precio['tamano_id'], $tamanosPermitidos)) {
                return response()->json([
                    'message' => 'Tamaño no permitido para este artículo.'
                ], 422);
            }
        }

        // Reemplazo total
        $articulo->precios()->delete();

        foreach ($data['precios'] as $precio) {
            $articulo->precios()->create([
                'tamano_id' => $precio['tamano_id'],
                'precio' => $precio['precio'],
            ]);
        }

        return response()->json([
            'message' => 'Precios actualizados correctamente.'
        ]);
    }
}
