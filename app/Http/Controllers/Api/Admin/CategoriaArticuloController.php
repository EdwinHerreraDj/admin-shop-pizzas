<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoriaArticulo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoriaArticuloController extends Controller
{
    public function index()
    {
        return CategoriaArticulo::orderBy('orden')
            ->orderBy('nombre')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'orden'  => 'nullable|integer',
            'activo' => 'required|boolean',
        ]);

        return CategoriaArticulo::create($data);
    }

    public function update(Request $request, CategoriaArticulo $categoriaArticulo)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'orden'  => 'nullable|integer',
            'activo' => 'required|boolean',
        ]);

        $categoriaArticulo->update($data);

        return $categoriaArticulo->fresh();
    }

    public function destroy(CategoriaArticulo $categoriaArticulo)
    {
        if ($categoriaArticulo->articulos()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar la categoría porque está asignada a artículos.'
            ], 422);
        }

        $categoriaArticulo->delete();

        return response()->noContent();
    }

    /**
     * Listar artículos de una categoría (ordenados)
     */
    public function articulos(CategoriaArticulo $categoria)
    {
        $articulos = DB::table('articulo_categoria')
            ->join('articulos', 'articulos.id', '=', 'articulo_categoria.articulo_id')
            ->where('articulo_categoria.categoria_articulo_id', $categoria->id)
            ->orderBy('articulo_categoria.orden')
            ->select(
                'articulos.id',
                'articulos.nombre',
                'articulo_categoria.orden'
            )
            ->get();

        return response()->json([
            'categoria' => [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
            ],
            'articulos' => $articulos,
        ]);
    }

    /**
     * Guardar nuevo orden de artículos en la categoría
     */
    public function guardarOrden(Request $request, CategoriaArticulo $categoria)
    {
        $data = $request->validate([
            'articulos' => ['required', 'array'],
            'articulos.*.id' => ['required', 'integer'],
            'articulos.*.orden' => ['required', 'integer'],
        ]);

        foreach ($data['articulos'] as $item) {
            DB::table('articulo_categoria')
                ->where('categoria_articulo_id', $categoria->id)
                ->where('articulo_id', $item['id'])
                ->update([
                    'orden' => $item['orden'],
                    'updated_at' => now(),
                ]);
        }

        return response()->json([
            'message' => 'Orden actualizado correctamente',
        ]);
    }
}
