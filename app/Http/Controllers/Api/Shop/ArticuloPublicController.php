<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Articulo;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ArticuloPublicController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 8);
        $now = Carbon::now()->format('H:i');

        $query = Articulo::query()
            ->where('publicado', true)

            // FILTRO HORARIO
            ->where(function ($q) use ($now) {
                $q->whereNull('hora_inicio_venta')
                    ->orWhereNull('hora_fin_venta')
                    ->orWhere(function ($sub) use ($now) {
                        $sub->where('hora_inicio_venta', '<=', $now)
                            ->where('hora_fin_venta', '>=', $now);
                    });
            })

            ->with([
                'tipoProducto:id,nombre',
                'categorias:id,nombre',
                'precios.tamano:id,nombre'
            ])

            ->orderBy('orden');

        // 🔎 Búsqueda
        if ($request->filled('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        // 🏷️ Filtro por categoría
        if ($request->filled('categoria_id')) {
            $query->whereHas('categorias', function ($q) use ($request) {
                $q->where('categorias_articulos.id', $request->categoria_id);
            });
        }

        return $query->paginate($perPage);
    }
}
