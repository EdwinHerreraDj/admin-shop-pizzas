<?php

namespace App\Http\Controllers;

use App\Models\TipoProducto;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TipoProductoController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:50|unique:tipos_productos',
            ], [
                'nombre.required' => 'El campo nombre es obligatorio.',
                'nombre.string' => 'El campo nombre debe ser una cadena de texto.',
                'nombre.max' => 'El campo nombre no debe exceder los 50 caracteres.',
                'nombre.unique' => 'El nombre ya existe. Por favor, elige otro.',
            ]);

            TipoProducto::create($request->only('nombre'));

            return response()->json([
                'success' => true,
                'message' => 'Tipo de producto creado exitosamente.',
                'redirect' => route('productos'),
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
        try {
            $tipoProducto = TipoProducto::find($id);

            if (! $tipoProducto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipo de producto no encontrado.',
                ], 404);
            }

            $request->validate([
                'nombre' => 'required|string|max:50|unique:tipos_productos,nombre,'.$id,
            ], [
                'nombre.required' => 'El campo nombre es obligatorio.',
                'nombre.string' => 'El campo nombre debe ser una cadena de texto.',
                'nombre.max' => 'El campo nombre no debe exceder los 50 caracteres.',
                'nombre.unique' => 'El nombre ya existe. Por favor, elige otro.',
            ]);

            $tipoProducto->update($request->only('nombre'));

            return response()->json([
                'success' => true,
                'message' => 'Tipo de producto actualizado exitosamente.',
                'redirect' => route('productos'),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        }
    }

    public function destroy($id)
    {
        $tipoProducto = TipoProducto::find($id);

        if (! $tipoProducto) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de producto no encontrado.',
            ], 404);
        }

        $tipoProducto->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipo de producto eliminado exitosamente.',
            'redirect' => route('productos'),
        ]);
    }
}
