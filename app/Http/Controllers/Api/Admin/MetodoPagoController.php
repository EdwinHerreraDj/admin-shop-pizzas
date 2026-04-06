<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MetodoPago;
use Illuminate\Http\Request;

class MetodoPagoController extends Controller
{
    public function index()
    {
        return response()->json(
            MetodoPago::orderBy('id')->get()
        );
    }

    public function update(Request $request, MetodoPago $metodo)
    {
        $validated = $request->validate([
            'activo_domicilio' => 'required|boolean',
            'activo_recogida'  => 'required|boolean',
        ]);

        $metodo->update($validated);

        return response()->json($metodo);
    }
}
