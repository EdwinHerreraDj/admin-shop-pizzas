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
        $tamanos = Tamano::orderBy('orden')->get();

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
