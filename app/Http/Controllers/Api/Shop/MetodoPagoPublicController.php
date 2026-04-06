<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\MetodoPago;

class MetodoPagoPublicController extends Controller
{
    public function index()
    {
        return response()->json(
            MetodoPago::select('clave', 'nombre', 'icono', 'activo_domicilio', 'activo_recogida')
                ->orderBy('id')
                ->get()
        );
    }
}
