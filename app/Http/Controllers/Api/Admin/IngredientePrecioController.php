<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingrediente;
use App\Models\TipoProducto;
use App\Models\IngredientePrecio;
use App\Models\Tamano;
use Illuminate\Http\Request;

class IngredientePrecioController extends Controller
{
    public function index(Ingrediente $ingrediente)
    {
        $tipos = TipoProducto::with('tamanos')->get();

        $precios = IngredientePrecio::where('ingrediente_id', $ingrediente->id)
            ->get()
            ->groupBy(['tipo_producto_id', 'tamano_id']);

        return response()->json([
            'ingrediente' => $ingrediente,
            'tipos' => $tipos->map(function ($tipo) use ($precios) {
                return [
                    'id' => $tipo->id,
                    'nombre' => $tipo->nombre,
                    'tamanos' => $tipo->tamanos,
                    'precios' => collect($precios[$tipo->id] ?? [])
                        ->mapWithKeys(fn($v, $k) => [$k => $v->first()->precio])
                        ->toArray(),
                ];
            }),
        ]);
    }

    public function store(Ingrediente $ingrediente)
    {
        $data = request()->validate([
            'precios' => 'array',
            'precios.*.tipo_producto_id' => 'required|exists:tipos_producto,id',
            'precios.*.tamano_id' => 'required|exists:tamanos,id',
            'precios.*.precio' => 'required|numeric|min:0',
        ]);

        // borrar precios existentes del ingrediente
        IngredientePrecio::where('ingrediente_id', $ingrediente->id)->delete();

        foreach ($data['precios'] as $precio) {
            IngredientePrecio::create([
                'ingrediente_id' => $ingrediente->id,
                ...$precio,
            ]);
        }

        return response()->noContent();
    }

    public function byIngrediente(Ingrediente $ingrediente)
    {
        $tipos = TipoProducto::orderBy('nombre')->get()->map(function ($tipo) use ($ingrediente) {

            $tamanos = $tipo->usa_tamanos
                ? Tamano::orderBy('orden')->get()
                : Tamano::where('nombre', 'Único')->get();

            $precios = IngredientePrecio::where('ingrediente_id', $ingrediente->id)
                ->where('tipo_producto_id', $tipo->id)
                ->get()
                ->keyBy('tamano_id')
                ->map(fn($p) => $p->precio);

            return [
                'id' => $tipo->id,
                'nombre' => $tipo->nombre,
                'tamanos' => $tamanos,
                'precios' => $precios,
            ];
        });

        return response()->json([
            'ingrediente' => $ingrediente->only('id', 'nombre'),
            'tipos' => $tipos,
        ]);
    }

    public function storeByIngrediente(Request $request, Ingrediente $ingrediente)
    {
        $data = $request->validate([
            'precios' => 'required|array',
            'precios.*.tipo_producto_id' => 'required|exists:tipos_producto,id',
            'precios.*.tamano_id' => 'required|exists:tamanos,id',
            'precios.*.precio' => 'required|numeric|min:0',
        ]);

        foreach ($data['precios'] as $item) {
            IngredientePrecio::updateOrCreate(
                [
                    'ingrediente_id' => $ingrediente->id,
                    'tipo_producto_id' => $item['tipo_producto_id'],
                    'tamano_id' => $item['tamano_id'],
                ],
                [
                    'precio' => $item['precio'],
                ]
            );
        }

        return response()->json(['ok' => true]);
    }
}
