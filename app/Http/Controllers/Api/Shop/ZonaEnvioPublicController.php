<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\ZonaEnvio;

class ZonaEnvioPublicController extends Controller
{
    public function index()
    {
        return response()->json(
            ZonaEnvio::where('activo', true)
                ->select('codigo_postal', 'barrio', 'recargo')
                ->orderBy('codigo_postal')
                ->get()
        );
    }
}
