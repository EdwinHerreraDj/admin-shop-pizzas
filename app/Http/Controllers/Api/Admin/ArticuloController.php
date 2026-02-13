<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ArticuloController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 10);

        $query = Articulo::query()
            ->with([
                'tipoProducto:id,nombre',
                'categorias:id,nombre'
            ])
            ->withCount([
                'ingredientes as ingredientes_base_count' => function ($q) {
                    $q->where('articulo_ingredientes.modo', 'base');
                }
            ]);

        // Filtro por nombre
        if ($request->filled('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        // Filtro por categoría
        if ($request->filled('categoria_id')) {
            $query->whereHas('categorias', function ($q) use ($request) {
                $q->where('categorias_articulos.id', $request->categoria_id);
            });
        }

        return $query
            ->orderBy('orden')
            ->paginate($perPage);
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:2000'],

            'personalizable' => ['nullable', 'boolean'],
            'tipo_producto_id' => [
                Rule::requiredIf(fn() => $request->boolean('personalizable')),
                'nullable',
                'exists:tipos_producto,id',
            ],

            'publicado' => ['nullable', 'boolean'],
            'orden' => ['nullable', 'integer', 'min:1'],
            'hora_inicio_venta' => ['nullable', 'date_format:H:i'],
            'hora_fin_venta' => ['nullable', 'date_format:H:i'],
            'imagen' => ['nullable', 'image', 'max:2048'],
        ]);

        // Defaults seguros
        $data['personalizable'] = $data['personalizable'] ?? false;
        $data['publicado'] = $data['publicado'] ?? false;

        // Blindaje: si NO es personalizable, el tipo no puede existir
        if (!$data['personalizable']) {
            $data['tipo_producto_id'] = null;
        }

        // Orden automático
        if (!isset($data['orden'])) {
            $data['orden'] = (Articulo::max('orden') ?? 0) + 1;
        }

        // Imagen
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
