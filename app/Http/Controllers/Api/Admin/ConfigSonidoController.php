<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConfigSonidoController extends Controller
{
    /**
     * GET /api/admin/configuracion/sonido
     */
    public function show()
    {
        $activo = Configuracion::get('sonido_activo', '1');
        $archivo = Configuracion::get('sonido_archivo');

        return response()->json([
            'sonido_activo'  => $activo === '1',
            'sonido_archivo' => $archivo,
            'tiene_archivo'  => $archivo && Storage::disk('public')->exists($archivo),
        ]);
    }

    /**
     * PUT /api/admin/configuracion/sonido
     */
    public function update(Request $request)
    {
        $request->validate([
            'sonido_activo' => 'required|boolean',
        ]);

        Configuracion::set('sonido_activo', $request->boolean('sonido_activo') ? '1' : '0');

        return $this->show();
    }

    /**
     * POST /api/admin/configuracion/sonido/archivo
     */
    public function subirArchivo(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:mp3,wav,ogg|max:2048',
        ]);

        // Eliminar archivo anterior si existe
        $anterior = Configuracion::get('sonido_archivo');
        if ($anterior && Storage::disk('public')->exists($anterior)) {
            Storage::disk('public')->delete($anterior);
        }

        $path = $request->file('archivo')->store('sonidos', 'public');

        Configuracion::set('sonido_archivo', $path);

        return $this->show();
    }

    /**
     * DELETE /api/admin/configuracion/sonido/archivo
     */
    public function eliminarArchivo()
    {
        $archivo = Configuracion::get('sonido_archivo');
        if ($archivo && Storage::disk('public')->exists($archivo)) {
            Storage::disk('public')->delete($archivo);
        }

        Configuracion::set('sonido_archivo', null);

        return $this->show();
    }
}
