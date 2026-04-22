<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\PaginaLegal;
use Illuminate\Http\JsonResponse;

class PaginaLegalPublicController extends Controller
{
    /**
     * Listado de páginas legales activas (solo slug, titulo, orden).
     * Útil para construir el menú/footer.
     */
    public function index(): JsonResponse
    {
        return response()->json(
            PaginaLegal::where('activa', true)
                ->orderBy('orden')
                ->orderBy('titulo')
                ->get(['slug', 'titulo', 'orden'])
        );
    }

    /**
     * Devuelve el contenido de una página legal por slug.
     */
    public function show(string $slug): JsonResponse
    {
        $pagina = PaginaLegal::where('slug', $slug)
            ->where('activa', true)
            ->firstOrFail(['slug', 'titulo', 'contenido', 'updated_at']);

        return response()->json($pagina);
    }
}
