<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EstadoTiendaController extends Controller
{
    /**
     * Leer estado actual de la tienda.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'tienda_cerrada'   => Configuracion::get('tienda_cerrada', '0') === '1',
            'titulo_cerrada'   => Configuracion::get(
                'tienda_titulo_cerrada',
                '¡Estamos cerrados!'
            ),
            'mensaje_cerrada'  => Configuracion::get(
                'tienda_mensaje_cerrada',
                'Nos tomamos unas vacaciones. Volveremos muy pronto para seguir preparándote las mejores pizzas. ¡Gracias por tu paciencia!'
            ),
        ]);
    }

    /**
     * Actualizar estado de la tienda.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tienda_cerrada'   => ['required', 'boolean'],
            'titulo_cerrada'   => ['nullable', 'string', 'max:150'],
            'mensaje_cerrada'  => ['nullable', 'string', 'max:1000'],
        ]);

        Configuracion::set('tienda_cerrada', $data['tienda_cerrada'] ? '1' : '0');

        if (array_key_exists('titulo_cerrada', $data)) {
            Configuracion::set('tienda_titulo_cerrada', $data['titulo_cerrada']);
        }
        if (array_key_exists('mensaje_cerrada', $data)) {
            Configuracion::set('tienda_mensaje_cerrada', $data['mensaje_cerrada']);
        }

        return response()->json([
            'message' => 'Estado de la tienda actualizado correctamente.',
        ]);
    }
}
