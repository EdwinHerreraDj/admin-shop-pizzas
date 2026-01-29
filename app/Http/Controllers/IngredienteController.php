<?php

namespace App\Http\Controllers;

use App\Models\Ingrediente;
use App\Models\IngredienteTipoProducto;
use Illuminate\Http\Request;

class IngredienteController extends Controller
{
    public function store(Request $request)
    {
        try {
            // 🔹 Validación
            $validated = $request->validate([
                'nombre' => 'required|string|max:100|unique:ingredientes,nombre',
                'categoria' => 'required|string|max:50',

                'precios' => 'required|array',
                'precios.*.pequena' => 'nullable|numeric|min:0',
                'precios.*.mediana' => 'nullable|numeric|min:0',
                'precios.*.grande' => 'nullable|numeric|min:0',
                'precios.*.unico' => 'nullable|numeric|min:0',
            ]);

            // 🔹 Crear ingrediente
            $ingrediente = Ingrediente::create([
                'nombre' => ucfirst(strtolower($validated['nombre'])),
                'categoria' => ucfirst(strtolower($validated['categoria'])),
            ]);

            foreach ($request->precios as $tipoId => $precioData) {
                // Limpiar valores nulos
                $precioData = array_filter($precioData, function ($v) {
                    return $v !== null && $v !== '';
                });

                // Solo guardar si hay algún valor
                if (! empty($precioData)) {
                    IngredienteTipoProducto::create([
                        'ingrediente_id' => $ingrediente->id,
                        'tipo_producto_id' => $tipoId,
                        'precio_extra_pequena' => $precioData['pequena'] ?? null,
                        'precio_extra_mediana' => $precioData['mediana'] ?? null,
                        'precio_extra_grande' => $precioData['grande'] ?? null,
                        'precio_extra_unico' => $precioData['unico'] ?? null,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Ingrediente creado exitosamente.',
                'redirect' => route('productos'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // 🔹 Errores de validación
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // 🔹 Errores generales
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al crear el ingrediente.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function edit(Request $request, $id)
    {
        try {
            // 🔹 Validación
            $validated = $request->validate([
                'nombre' => 'string|max:100|unique:ingredientes,nombre,'.$id,
                'categoria' => 'string|max:50',

                'precios' => 'array',
                'precios.*.pequena' => 'nullable|numeric|min:0',
                'precios.*.mediana' => 'nullable|numeric|min:0',
                'precios.*.grande' => 'nullable|numeric|min:0',
                'precios.*.unico' => 'nullable|numeric|min:0',
            ]);

            // 🔹 Actualizar ingrediente
            $ingrediente = Ingrediente::findOrFail($id);
            $ingrediente->update([
                'nombre' => ucfirst(strtolower($validated['nombre'])),
                'categoria' => ucfirst(strtolower($validated['categoria'])),
            ]);

            // 🔹 Actualizar o crear precios
            foreach ($validated['precios'] as $tipoId => $precios) {
                // filtrar null y vacíos
                $soloValores = array_filter($precios, fn ($v) => $v !== null && $v !== '');

                if (! empty($soloValores)) {
                    IngredienteTipoProducto::updateOrCreate(
                        [
                            'ingrediente_id' => $ingrediente->id,
                            'tipo_producto_id' => $tipoId,
                        ],
                        [
                            'precio_extra_pequena' => $precios['pequena'] ?? null,
                            'precio_extra_mediana' => $precios['mediana'] ?? null,
                            'precio_extra_grande' => $precios['grande'] ?? null,
                            'precio_extra_unico' => $precios['unico'] ?? null,
                        ]
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Ingrediente actualizado exitosamente.',
                'redirect' => route('productos'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // 🔹 Errores de validación
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // 🔹 Errores generales
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al actualizar el ingrediente.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $ingrediente = Ingrediente::findOrFail($id);
            $ingrediente->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ingrediente eliminado exitosamente.',
                'redirect' => route('productos'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al eliminar el ingrediente.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getByTipo($tipoId)
    {
        $ingredientesPorTipo = Ingrediente::whereHas('tiposProductos', function ($q) use ($tipoId) {
            $q->where('tipos_productos.id', $tipoId); // importante referirse al id correcto
        })
            ->with(['tiposProductos' => function ($q) use ($tipoId) {
                $q->where('tipos_productos.id', $tipoId); // solo este tipo
            }])
            ->get();

        return response()->json($ingredientesPorTipo);
    }
}
