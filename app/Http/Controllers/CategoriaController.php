<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategoriaController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:50|unique:categoria_models',
            ], [
                'nombre.required' => 'El campo nombre es obligatorio.',
                'nombre.string' => 'El campo nombre debe ser una cadena de texto.',
                'nombre.max' => 'El campo nombre no debe exceder los 50 caracteres.',
                'nombre.unique' => 'El nombre de la categoría ya existe. Por favor, elige otro nombre.',
            ]);

            // Crear categoría
            $categoria = Categoria::create(['nombre' => $validatedData['nombre']]);

            return response()->json([
                'success' => true,
                'message' => 'Categoría creada exitosamente.',
                'redirect' => route('productos'),
                'data' => $categoria,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        }
    }

    public function edit(Request $request, $id)
    {
        $validatedData = request()->validate([
            'nombre' => 'required|string|max:50|unique:categoria_models,nombre,'.request('id'),
        ], [
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.string' => 'El campo nombre debe ser una cadena de texto.',
            'nombre.max' => 'El campo nombre no debe exceder los 50 caracteres.',
            'nombre.unique' => 'El nombre de la categoría ya existe. Por favor, elige otro nombre.',
        ]);

        $categoria = Categoria::findOrFail($id);
        $categoria->nombre = $validatedData['nombre'];
        $categoria->save();

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada exitosamente.',
            'redirect' => route('productos'),
        ]);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        $categoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoría y registros relacionados eliminados correctamente.',
        ]);
    }
}
