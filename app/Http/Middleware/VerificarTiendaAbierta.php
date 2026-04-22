<?php

namespace App\Http\Middleware;

use App\Models\Configuracion;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarTiendaAbierta
{
    public function handle(Request $request, Closure $next): Response
    {
        $cerrada = Configuracion::get('tienda_cerrada', '0') === '1';

        if ($cerrada) {
            return response()->json([
                'message'        => 'La tienda está cerrada temporalmente.',
                'tienda_cerrada' => true,
                'titulo'         => Configuracion::get('tienda_titulo_cerrada', '¡Estamos cerrados!'),
                'mensaje'        => Configuracion::get(
                    'tienda_mensaje_cerrada',
                    'Nos tomamos unas vacaciones. Volveremos muy pronto para seguir preparándote las mejores pizzas. ¡Gracias por tu paciencia!'
                ),
            ], 503);
        }

        return $next($request);
    }
}
