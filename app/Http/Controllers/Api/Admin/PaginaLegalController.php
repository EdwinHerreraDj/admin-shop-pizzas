<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaginaLegal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaginaLegalController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            PaginaLegal::orderBy('orden')->orderBy('titulo')->get()
        );
    }

    public function show(PaginaLegal $paginaLegal): JsonResponse
    {
        return response()->json($paginaLegal);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'titulo'    => ['required', 'string', 'max:150'],
            'slug'      => ['nullable', 'string', 'max:100', 'unique:paginas_legales,slug'],
            'contenido' => ['nullable', 'string'],
            'orden'     => ['nullable', 'integer', 'min:0'],
            'activa'    => ['required', 'boolean'],
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['titulo']);

        // Asegurar unicidad del slug
        $base = $data['slug'];
        $i = 1;
        while (PaginaLegal::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $base . '-' . $i++;
        }

        $pagina = PaginaLegal::create($data);

        return response()->json($pagina, 201);
    }

    public function update(Request $request, PaginaLegal $paginaLegal): JsonResponse
    {
        $data = $request->validate([
            'titulo'    => ['required', 'string', 'max:150'],
            'slug'      => ['nullable', 'string', 'max:100', 'unique:paginas_legales,slug,' . $paginaLegal->id],
            'contenido' => ['nullable', 'string'],
            'orden'     => ['nullable', 'integer', 'min:0'],
            'activa'    => ['required', 'boolean'],
        ]);

        $paginaLegal->update($data);

        return response()->json($paginaLegal->fresh());
    }

    public function destroy(PaginaLegal $paginaLegal): JsonResponse
    {
        $paginaLegal->delete();
        return response()->json(['message' => 'Página eliminada.']);
    }
}
