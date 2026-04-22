<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;

class EmpresaPublicController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'nombre'            => Configuracion::get('empresa_nombre', 'Pizzería Casa de Campo'),
            'descripcion'       => Configuracion::get('empresa_descripcion', ''),
            'email'             => Configuracion::get('empresa_email', ''),
            'telefono'          => Configuracion::get('empresa_telefono', ''),
            'whatsapp'          => Configuracion::get('empresa_whatsapp', ''),
            'direccion'         => Configuracion::get('empresa_direccion', ''),
            'codigo_postal'     => Configuracion::get('empresa_codigo_postal', ''),
            'ciudad'            => Configuracion::get('empresa_ciudad', ''),
            'cif'               => Configuracion::get('empresa_cif', ''),
            'google_maps_embed' => Configuracion::get('empresa_google_maps_embed', ''),
            'facebook'          => Configuracion::get('empresa_facebook', ''),
            'instagram'         => Configuracion::get('empresa_instagram', ''),
        ]);
    }
}
