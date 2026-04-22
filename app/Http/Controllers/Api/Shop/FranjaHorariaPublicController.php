<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\FranjaHoraria;
use Carbon\Carbon;

class FranjaHorariaPublicController extends Controller
{
    // Intervalo en minutos entre cada slot
    private const INTERVALO = 30;

    // Minutos mínimos de antelación para poder seleccionar un slot
    private const ANTELACION_MINIMA = 60;

    public function index()
    {
        $ahora = Carbon::now();

        // Carbon: 1=lunes … 7=domingo → convertimos a 0=lunes … 6=domingo
        $diaSemana = $ahora->dayOfWeekIso - 1;

        $franjas = FranjaHoraria::activas()
            ->delDia($diaSemana)
            ->orderBy('hora_apertura')
            ->get();

        $horaMinima = $ahora->copy()->addMinutes(self::ANTELACION_MINIMA)->format('H:i');

        $slots = [];

        foreach ($franjas as $franja) {
            $inicio = Carbon::createFromFormat('H:i', substr($franja->hora_apertura, 0, 5));
            $fin    = Carbon::createFromFormat('H:i', substr($franja->hora_cierre, 0, 5));

            while ($inicio->lt($fin)) {
                $slot = $inicio->format('H:i');

                // Solo incluir slots que estén al menos a 1h de ahora
                if ($slot >= $horaMinima) {
                    $slots[] = $slot;
                }

                $inicio->addMinutes(self::INTERVALO);
            }
        }

        return response()->json([
            'fecha'      => $ahora->toDateString(),
            'dia_semana' => $diaSemana,
            'dia_nombre' => FranjaHoraria::DIAS[$diaSemana] ?? '?',
            'slots'      => array_values(array_unique($slots)),
        ]);
    }

    /**
     * Devuelve el horario semanal agrupado por día.
     * Ideal para mostrar en el footer.
     */
    public function semanal()
    {
        $franjas = FranjaHoraria::activas()
            ->orderBy('dia_semana')
            ->orderBy('hora_apertura')
            ->get();

        $horario = [];
        foreach (FranjaHoraria::DIAS as $diaIdx => $diaNombre) {
            $delDia = $franjas->where('dia_semana', $diaIdx);

            $horario[] = [
                'dia_semana' => $diaIdx,
                'dia_nombre' => $diaNombre,
                'cerrado'    => $delDia->isEmpty(),
                'franjas'    => $delDia->map(fn ($f) => [
                    'apertura' => substr($f->hora_apertura, 0, 5),
                    'cierre'   => substr($f->hora_cierre, 0, 5),
                ])->values(),
            ];
        }

        return response()->json($horario);
    }
}
