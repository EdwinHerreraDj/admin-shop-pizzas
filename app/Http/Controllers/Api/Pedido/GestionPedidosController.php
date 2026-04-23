<?php

namespace App\Http\Controllers\Api\Pedido;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Repartidor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GestionPedidosController extends Controller
{
    // Todos los estados — el jefe ve todo
    private const TODOS_ESTADOS = [
        'pendiente_pago',
        'pendiente',
        'aceptado',
        'en_preparacion',
        'listo',
        'en_camino',
        'entregado',
        'cancelado',
    ];

    // Relaciones estándar para respuestas completas
    private const WITH = [
        'items.ingredientes.ingrediente',
        'zonaEnvio',
        'repartidor',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/admin/gestion/pedidos
    // Listado completo con filtros
    // ─────────────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'fecha_desde'   => ['nullable', 'date'],
            'fecha_hasta'   => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'estado'        => ['nullable', Rule::in(self::TODOS_ESTADOS)],
            'tipo_entrega'  => ['nullable', 'in:domicilio,recogida'],
            'search'        => ['nullable', 'string', 'max:100'],
        ]);

        $query = Pedido::with(self::WITH)->orderByDesc('created_at');

        // Filtro fecha
        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->input('fecha_desde'));
        } else {
            // Por defecto: hoy
            $query->whereDate('created_at', now()->toDateString());
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->input('fecha_hasta'));
        }

        // Filtro estado
        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        // Filtro tipo entrega
        if ($request->filled('tipo_entrega')) {
            $query->where('tipo_entrega', $request->input('tipo_entrega'));
        }

        // Búsqueda por código, nombre o teléfono
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                    ->orWhere('cliente_nombre', 'like', "%{$search}%")
                    ->orWhere('cliente_telefono', 'like', "%{$search}%");
            });
        }

        $pedidos = $query->paginate(10)->withQueryString();

        return response()->json($pedidos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/admin/gestion/resumen
    // KPIs del rango seleccionado — coherente con los filtros de la tabla
    // ─────────────────────────────────────────────────────────────────────────

    public function resumen(Request $request): JsonResponse
    {
        $request->validate([
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
        ]);

        $desde = $request->filled('fecha_desde')
            ? $request->input('fecha_desde')
            : now()->toDateString();

        $hasta = $request->filled('fecha_hasta')
            ? $request->input('fecha_hasta')
            : $desde;

        $pedidos = Pedido::whereDate('created_at', '>=', $desde)
            ->whereDate('created_at', '<=', $hasta)
            ->get();

        $entregados = $pedidos->where('estado', 'entregado');
        $cancelados = $pedidos->where('estado', 'cancelado');
        $activos    = $pedidos->whereNotIn('estado', ['entregado', 'cancelado']);

        $totalVentas     = $entregados->sum('total');
        $totalGastosEnvio = $entregados->sum('gastos_envio');
        $nEntregados     = $entregados->count();
        $ticketMedio     = $nEntregados > 0 ? round($totalVentas / $nEntregados, 2) : 0;

        // Desglose por método de pago (sobre pedidos entregados)
        $porMetodoPago = $entregados
            ->groupBy('metodo_pago')
            ->map(fn($grupo) => [
                'count' => $grupo->count(),
                'total' => round($grupo->sum('total'), 2),
            ]);

        return response()->json([
            'rango'            => ['desde' => $desde, 'hasta' => $hasta],
            'total_pedidos'    => $pedidos->count(),
            'total_ventas'     => round($totalVentas, 2),
            'total_gastos_envio' => round($totalGastosEnvio, 2),
            'n_entregados'     => $nEntregados,
            'ticket_medio'     => $ticketMedio,
            'activos'          => $activos->count(),
            'cancelados'       => $cancelados->count(),
            // Tipo entrega — sobre todos los pedidos del rango
            'domicilio'        => $pedidos->where('tipo_entrega', 'domicilio')->count(),
            'recogida'         => $pedidos->where('tipo_entrega', 'recogida')->count(),
            // Métodos de pago — sobre entregados
            'por_metodo_pago'  => $porMetodoPago,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/admin/gestion/pedidos/{pedido}
    // Detalle completo de un pedido
    // ─────────────────────────────────────────────────────────────────────────

    public function show(Pedido $pedido): JsonResponse
    {
        $pedido->load(self::WITH);
        return response()->json($pedido);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/admin/gestion/pedidos/{pedido}/estado
    // Cambio libre de estado — sin restricciones de flujo
    // ─────────────────────────────────────────────────────────────────────────

    public function cambiarEstado(Request $request, Pedido $pedido): JsonResponse
    {
        $data = $request->validate([
            'estado'  => ['required', Rule::in(self::TODOS_ESTADOS)],
            'motivo'  => ['nullable', 'string', 'max:500'],
        ]);

        $updates = ['estado' => $data['estado']];

        // Guardar motivo en observaciones si se cancela con motivo
        if ($data['estado'] === 'cancelado' && ! empty($data['motivo'])) {
            $updates['observaciones'] = trim(
                ($pedido->observaciones ? $pedido->observaciones . "\n" : '')
                    . '[CANCELADO] ' . $data['motivo']
            );
        }

        // Registrar tiempos automáticos
        if ($data['estado'] === 'en_camino' && ! $pedido->hora_salida) {
            $updates['hora_salida'] = now();
        }
        if ($data['estado'] === 'entregado' && ! $pedido->hora_entrega) {
            $updates['hora_entrega'] = now();
        }

        $pedido->update($updates);

        return response()->json([
            'message' => "Estado actualizado a «{$data['estado']}».",
            'pedido'  => $pedido->fresh(self::WITH),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/admin/gestion/pedidos/{pedido}/observaciones
    // Editar observaciones y datos del cliente
    // ─────────────────────────────────────────────────────────────────────────

    public function actualizarObservaciones(Request $request, Pedido $pedido): JsonResponse
    {
        $data = $request->validate([
            'observaciones'    => ['nullable', 'string', 'max:1000'],
            'cliente_nombre'   => ['nullable', 'string', 'max:255'],
            'cliente_telefono' => ['nullable', 'string', 'max:20'],
            'direccion'        => ['nullable', 'string', 'max:500'],
        ]);

        $pedido->update(array_filter($data, fn($v) => $v !== null));

        return response()->json([
            'message' => 'Pedido actualizado.',
            'pedido'  => $pedido->fresh(self::WITH),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/admin/gestion/pedidos/{pedido}/repartidor
    // Asignar o reasignar repartidor
    // ─────────────────────────────────────────────────────────────────────────

    public function asignarRepartidor(Request $request, Pedido $pedido): JsonResponse
    {
        $data = $request->validate([
            'repartidor_id' => ['nullable', 'exists:repartidores,id'],
        ]);

        if ($data['repartidor_id']) {
            $repartidor = Repartidor::findOrFail($data['repartidor_id']);
            if (! $repartidor->activo) {
                return response()->json(['message' => 'El repartidor no está activo.'], 422);
            }
        }

        $pedido->update(['repartidor_id' => $data['repartidor_id']]);

        return response()->json([
            'message' => $data['repartidor_id'] ? 'Repartidor asignado.' : 'Repartidor desasignado.',
            'pedido'  => $pedido->fresh(self::WITH),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/admin/gestion/repartidores
    // Lista de repartidores activos para el selector
    // ─────────────────────────────────────────────────────────────────────────

    public function repartidores(): JsonResponse
    {
        $repartidores = Repartidor::where('activo', true)
            ->select('id', 'nombre', 'telefono')
            ->orderBy('nombre')
            ->get();

        return response()->json($repartidores);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/admin/gestion/pedidos/{pedido}
    // Eliminar un pedido completo (con sus items e ingredientes en cascada)
    // ─────────────────────────────────────────────────────────────────────────

    public function destroy(Pedido $pedido): JsonResponse
    {
        $codigo = $pedido->codigo;

        // Limpiar el pedido de la lista de activos en localStorage es
        // responsabilidad del frontend del cliente — aquí solo borramos en BD.
        // La relación items → ingredientes tiene cascadeOnDelete configurado.
        $pedido->delete();

        return response()->json([
            'message' => "Pedido {$codigo} eliminado correctamente.",
        ]);
    }
}
