<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;

class CardsInfoPublicController extends Controller
{
    public function show(): JsonResponse
    {
        $json = Configuracion::get('cards_info');
        $cards = $json ? json_decode($json, true) : [];

        // Devolver solo las cards activas
        $activas = array_values(array_filter($cards ?? [], function ($card) {
            return !empty($card['activa']);
        }));

        return response()->json(['cards' => $activas]);
    }
}
