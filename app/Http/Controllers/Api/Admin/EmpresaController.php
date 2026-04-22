<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmpresaController extends Controller
{
    private const CLAVES = [
        'empresa_nombre',
        'empresa_descripcion',
        'empresa_email',
        'empresa_telefono',
        'empresa_whatsapp',
        'empresa_direccion',
        'empresa_codigo_postal',
        'empresa_ciudad',
        'empresa_cif',
        'empresa_google_maps_embed',
        'empresa_facebook',
        'empresa_instagram',
    ];

    public function show(): JsonResponse
    {
        $data = [];
        foreach (self::CLAVES as $clave) {
            $data[$clave] = Configuracion::get($clave, '');
        }
        return response()->json($data);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'empresa_nombre'            => ['nullable', 'string', 'max:150'],
            'empresa_descripcion'       => ['nullable', 'string', 'max:1000'],
            'empresa_email'             => ['nullable', 'email', 'max:150'],
            'empresa_telefono'          => ['nullable', 'string', 'max:30'],
            'empresa_whatsapp'          => ['nullable', 'string', 'max:30'],
            'empresa_direccion'         => ['nullable', 'string', 'max:255'],
            'empresa_codigo_postal'     => ['nullable', 'string', 'max:15'],
            'empresa_ciudad'            => ['nullable', 'string', 'max:100'],
            'empresa_cif'               => ['nullable', 'string', 'max:20'],
            'empresa_google_maps_embed' => ['nullable', 'string', 'max:2000'],
            'empresa_facebook'          => ['nullable', 'string', 'max:255'],
            'empresa_instagram'         => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($data as $clave => $valor) {
            Configuracion::set($clave, $valor);
        }

        return response()->json(['message' => 'Información de empresa actualizada correctamente.']);
    }
}
