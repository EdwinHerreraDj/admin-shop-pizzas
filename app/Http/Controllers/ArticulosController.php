<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArticuloRequest;
use App\Models\Articulo;
use Illuminate\Support\Facades\Storage;

class ArticulosController extends Controller
{
    public function store(ArticuloRequest $request)
    {
        // Ya está validado automáticamente
        $validated = $request->validated();

        // Subir imagen si existe
        $imagenPath = null;
        if ($request->hasFile('imagen_url')) {
            $imagenPath = $request->file('imagen_url')->store('articulos', 'public');
        }

        // Crear artículo
        $articulo = Articulo::create([
            'categoria_id' => $validated['categoria_id'],
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'imagen_url' => $imagenPath,
            'precio_pequena' => $validated['precio_pequena'] ?? null,
            'precio_mediana' => $validated['precio_mediana'] ?? null,
            'precio_grande' => $validated['precio_grande'] ?? null,
            'precio_unico' => $validated['precio_unico'] ?? null,
            'es_personalizable' => $request->has('es_personalizable') ? 1 : 0,
            'tipo_producto_id' => $validated['tipo_producto_id'] ?? null,
            'publicado' => $request->boolean('publicado'),

        ]);

        // Vincular ingredientes
        if (! empty($validated['ingredientes'])) {
            $articulo->ingredientes()->sync($validated['ingredientes']);
        }

        // Respuesta JSON
        return response()->json([
            'success' => true,
            'message' => 'Artículo creado exitosamente.',
            'redirect' => route('productos'),
            'data' => $articulo,
        ]);
    }

    // Otros métodos (editar, actualizar, eliminar) pueden ser añadidos aquí
    public function edit(ArticuloRequest $request, $id)
    {
        $validated = $request->validated();

        $articulo = Articulo::find($id);
        if (! $articulo) {
            return response()->json([
                'success' => false,
                'message' => 'Artículo no encontrado.',
            ], 404);
        }

        // Ingredientes
        if (! empty($validated['ingredientes'])) {
            $articulo->ingredientes()->sync($validated['ingredientes']);
        }

        // Imagen
        if ($request->hasFile('imagen_url')) {
            if ($articulo->imagen_url) {
                Storage::disk('public')->delete($articulo->imagen_url);
            }
            $articulo->imagen_url = $request->file('imagen_url')->store('articulos', 'public');
        }

        // Resto de campos
        $articulo->update([
            'categoria_id' => $validated['categoria_id'],
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'precio_pequena' => $validated['precio_pequena'] ?? null,
            'precio_mediana' => $validated['precio_mediana'] ?? null,
            'precio_grande' => $validated['precio_grande'] ?? null,
            'precio_unico' => $validated['precio_unico'] ?? null,
            'es_personalizable' => $request->has('es_personalizable') ? 1 : 0,
            'publicado' => $request->boolean('publicado'),

        ]);

        return response()->json([
            'success' => true,
            'message' => 'Artículo actualizado exitosamente.',
            'redirect' => route('productos'),
            'data' => $articulo,
        ]);
    }

    public function destroy($id)
    {
        $articulo = Articulo::find($id);

        if (! $articulo) {
            return response()->json([
                'success' => false,
                'message' => 'Artículo no encontrado.',
            ], 404);
        }

        // Eliminar la imagen asociada si existe
        if ($articulo->imagen_url) {
            Storage::disk('public')->delete($articulo->imagen_url);
        }

        $articulo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artículo eliminado exitosamente.',
        ]);
    }
}
