<?php

namespace App\Http\Controllers\Api\Pedido;

use App\Http\Controllers\Controller;
use App\Http\Requests\CambiarEstadoPedidoRequest;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PedidoCocinaController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Estados visibles en el panel cocina (entregado NO se muestra)
    // ─────────────────────────────────────────────────────────────────────────
    private const ESTADOS_COCINA = [
        'pendiente',
        'aceptado',
        'en_preparacion',
        'listo',
        'en_camino',
    ];

    // Transiciones permitidas — flujo completo sin repartidores
    private const TRANSICIONES_COCINA = [
        'pendiente'      => ['aceptado',       'cancelado'],
        'aceptado'       => ['en_preparacion', 'cancelado'],
        'en_preparacion' => ['listo',          'cancelado'],
        'listo'          => ['en_camino',      'cancelado'],
        'en_camino'      => ['entregado'],
    ];

    // Relaciones que se cargan siempre.
    // Garantiza que el frontend recibe el pedido hidratado completo
    // tanto en GET como en la respuesta del PATCH.
    private const WITH = [
        'items.ingredientes.ingrediente',   // .ingrediente resuelve el nombre del extra
        'zonaEnvio',
        'repartidor',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/admin/pedidos
    // ─────────────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'fecha' => ['nullable', 'date'],
        ]);

        $query = Pedido::with(self::WITH)->orderBy('created_at', 'asc');

        // Filtro de estado — acepta string único o array
        // ?estado=pendiente  |  ?estado[]=pendiente&estado[]=aceptado
        if ($request->filled('estado')) {
            $solicitados = (array) $request->input('estado');
            $validos     = array_values(array_intersect($solicitados, self::ESTADOS_COCINA));

            // Fix #3: si todos los estados enviados son inválidos para cocina → 422
            if (empty($validos)) {
                return response()->json([
                    'message'         => 'Ninguno de los estados enviados pertenece al módulo cocina.',
                    'estados_validos' => self::ESTADOS_COCINA,
                ], 422);
            }

            $query->whereIn('estado', $validos);
        } else {
            $query->whereIn('estado', self::ESTADOS_COCINA);
        }

        // Fix #2: string limpio, sin ambigüedad de zona horaria del helper today()
        $fecha = $request->filled('fecha')
            ? $request->input('fecha')
            : now()->toDateString();

        $query->whereDate('created_at', $fecha);

        return response()->json($query->get());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/admin/pedidos/{pedido}/estado
    // ─────────────────────────────────────────────────────────────────────────

    public function cambiarEstado(
        CambiarEstadoPedidoRequest $request,
        Pedido $pedido
    ): JsonResponse {
        $nuevoEstado = $request->validated()['estado'];

        // 1. El pedido debe estar en un estado gestionable por cocina
        if (! array_key_exists($pedido->estado, self::TRANSICIONES_COCINA)) {
            return response()->json([
                'message' => "El pedido está en «{$pedido->estado}» y no pertenece al módulo cocina.",
            ], 422);
        }

        // 2. La transición debe ser válida para el estado actual
        $permitidas = self::TRANSICIONES_COCINA[$pedido->estado];

        if (! in_array($nuevoEstado, $permitidas, true)) {
            return response()->json([
                'message'                 => "Transición no permitida: «{$pedido->estado}» → «{$nuevoEstado}».",
                'estado_actual'           => $pedido->estado,
                'transiciones_permitidas' => $permitidas,
            ], 422);
        }

        // 3. Persistir con timestamps automáticos
        $updates = ['estado' => $nuevoEstado];

        if ($nuevoEstado === 'en_camino' && ! $pedido->hora_salida) {
            $updates['hora_salida'] = now();
        }
        if ($nuevoEstado === 'entregado' && ! $pedido->hora_entrega) {
            $updates['hora_entrega'] = now();
        }

        $pedido->update($updates);

        // 4. Broadcast (activar al configurar Echo/Reverb)
        // event(new \App\Events\PedidoEstadoCambiado($pedido));

        return response()->json([
            'message' => "Pedido actualizado a «{$nuevoEstado}».",
            'pedido'  => $pedido->fresh(self::WITH),
        ]);
    }
}