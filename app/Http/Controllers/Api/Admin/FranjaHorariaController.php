<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FranjaHoraria;
use Illuminate\Http\Request;

class FranjaHorariaController extends Controller
{
    public function index()
    {
        return response()->json(
            FranjaHoraria::orderBy('dia_semana')
                ->orderBy('hora_apertura')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dia_semana'    => 'required|integer|min:0|max:6',
            'hora_apertura' => 'required|date_format:H:i',
            'hora_cierre'   => 'required|date_format:H:i|after:hora_apertura',
            'activo'        => 'required|boolean',
        ]);

        $franja = FranjaHoraria::create($validated);

        return response()->json($franja, 201);
    }

    public function update(Request $request, FranjaHoraria $franja)
    {
        $validated = $request->validate([
            'dia_semana'    => 'required|integer|min:0|max:6',
            'hora_apertura' => 'required|date_format:H:i',
            'hora_cierre'   => 'required|date_format:H:i|after:hora_apertura',
            'activo'        => 'required|boolean',
        ]);

        $franja->update($validated);

        return response()->json($franja);
    }

    public function destroy(FranjaHoraria $franja)
    {
        $franja->delete();

        return response()->json(['message' => 'Franja eliminada']);
    }
}
