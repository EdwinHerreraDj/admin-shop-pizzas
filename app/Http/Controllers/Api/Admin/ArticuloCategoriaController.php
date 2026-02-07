<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use App\Models\CategoriaArticulo;
use Illuminate\Http\Request;

class ArticuloCategoriaController extends Controller
{
    /**
     * Listar categorías y marcar las asignadas al artículo
     */
    public function index(Articulo $articulo)
    {
        $categorias = CategoriaArticulo::orderBy('orden')->get();

        $asignadas = $articulo->categorias
            ->mapWithKeys(fn($cat) => [
                $cat->id => [
                    'orden' => $cat->pivot->orden,
                ],
            ]);

        return response()->json([
            'categorias' => $categorias->map(function ($cat) use ($asignadas) {
                return [
                    'id' => $cat->id,
                    'nombre' => $cat->nombre,
                    'orden' => $cat->orden,
                    'asignada' => $asignadas->has($cat->id),
                    'orden_pivot' => $asignadas[$cat->id]['orden'] ?? null,
                ];
            }),
        ]);
    }

    /**
     * Sincronizar categorías del artículo
     */
    public function sync(Request $request, Articulo $articulo)
    {
        $data = $request->validate([
            'categorias' => ['array'],
            'categorias.*.id' => ['required', 'exists:categorias_articulos,id'],
            'categorias.*.orden' => ['nullable', 'integer'],
        ]);

        $sync = [];

        foreach ($data['categorias'] as $cat) {
            $sync[$cat['id']] = [
                'orden' => $cat['orden'] ?? 0,
            ];
        }

        $articulo->categorias()->sync($sync);

        return response()->json([
            'message' => 'Categorías actualizadas correctamente',
        ]);
    }
}
