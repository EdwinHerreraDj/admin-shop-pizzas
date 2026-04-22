<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardsInfoController extends Controller
{
    private const CLAVE = 'cards_info';

    private const DEFAULT_CARDS = [
        [
            'icono'       => '🛵',
            'titulo'      => 'Entrega rápida',
            'descripcion' => 'Tu pedido en casa en 30-45 minutos aproximadamente.',
            'activa'      => true,
        ],
        [
            'icono'       => '🍕',
            'titulo'      => 'Ingredientes frescos',
            'descripcion' => 'Elaboramos cada pizza con productos seleccionados.',
            'activa'      => true,
        ],
        [
            'icono'       => '📞',
            'titulo'      => '¿Alguna duda?',
            'descripcion' => 'Contáctanos y te ayudamos con tu pedido.',
            'activa'      => true,
        ],
    ];

    /**
     * Leer las cards actuales.
     */
    public function show(): JsonResponse
    {
        $json = Configuracion::get(self::CLAVE);

        $cards = $json ? json_decode($json, true) : self::DEFAULT_CARDS;

        // Asegurar siempre 3 posiciones
        $cards = array_pad($cards ?? [], 3, [
            'icono'       => '',
            'titulo'      => '',
            'descripcion' => '',
            'activa'      => false,
        ]);

        return response()->json(['cards' => array_slice($cards, 0, 3)]);
    }

    /**
     * Actualizar las cards.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cards'                 => ['required', 'array', 'size:3'],
            'cards.*.icono'         => ['nullable', 'string', 'max:20'],
            'cards.*.titulo'        => ['nullable', 'string', 'max:100'],
            'cards.*.descripcion'   => ['nullable', 'string', 'max:500'],
            'cards.*.activa'        => ['required', 'boolean'],
        ]);

        Configuracion::set(self::CLAVE, json_encode($data['cards']));

        return response()->json([
            'message' => 'Cards actualizadas correctamente.',
        ]);
    }
}
