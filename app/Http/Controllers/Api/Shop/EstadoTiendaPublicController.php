<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;

class EstadoTiendaPublicController extends Controller
{
    public function show(): JsonResponse
    {
        $cerrada = Configuracion::get('tienda_cerrada', '0') === '1';

        return response()->json([
            'cerrada' => $cerrada,
            'titulo'  => Configuracion::get(
                'tienda_titulo_cerrada',
                '¡Estamos cerrados!'
            ),
            'mensaje' => Configuracion::get(
                'tienda_mensaje_cerrada',
                'Nos tomamos unas vacaciones. Volveremos muy pronto para seguir preparándote las mejores pizzas. ¡Gracias por tu paciencia!'
            ),
        ]);
    }
}
