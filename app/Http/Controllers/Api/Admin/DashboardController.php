<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $hoy = Carbon::today();
        $inicioSemana = Carbon::now()->subDays(6)->startOfDay();
        $inicioMes = Carbon::now()->startOfMonth();

        // ── Pedidos de hoy por estado ─────────────────────────────────
        $pedidosHoy = Pedido::whereDate('created_at', $hoy)->get();

        $porEstado = [
            'pendiente'      => $pedidosHoy->where('estado', 'pendiente')->count(),
            'aceptado'       => $pedidosHoy->where('estado', 'aceptado')->count(),
            'en_preparacion' => $pedidosHoy->where('estado', 'en_preparacion')->count(),
            'listo'          => $pedidosHoy->where('estado', 'listo')->count(),
            'en_camino'      => $pedidosHoy->where('estado', 'en_camino')->count(),
            'entregado'      => $pedidosHoy->where('estado', 'entregado')->count(),
            'cancelado'      => $pedidosHoy->where('estado', 'cancelado')->count(),
        ];

        $entregadosHoy = $pedidosHoy->where('estado', 'entregado');
        $ventasHoy = round($entregadosHoy->sum('total'), 2);
        $ticketMedioHoy = $entregadosHoy->count() > 0
            ? round($ventasHoy / $entregadosHoy->count(), 2)
            : 0;

        // ── Ventas del mes ────────────────────────────────────────────
        $entregadosMes = Pedido::where('estado', 'entregado')
            ->whereDate('created_at', '>=', $inicioMes)
            ->get();

        $ventasMes = round($entregadosMes->sum('total'), 2);
        $pedidosMes = $entregadosMes->count();
        $ticketMedioMes = $pedidosMes > 0 ? round($ventasMes / $pedidosMes, 2) : 0;

        // ── Ventas por día (últimos 7 días) ───────────────────────────
        $ventasPorDia = Pedido::where('estado', 'entregado')
            ->whereDate('created_at', '>=', $inicioSemana)
            ->select(
                DB::raw('DATE(created_at) as fecha'),
                DB::raw('COUNT(*) as pedidos'),
                DB::raw('ROUND(SUM(total), 2) as ventas')
            )
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        // Rellenar días sin pedidos con 0
        $diasSemana = [];
        for ($i = 6; $i >= 0; $i--) {
            $fecha = Carbon::now()->subDays($i)->format('Y-m-d');
            $dia = $ventasPorDia->firstWhere('fecha', $fecha);
            $diasSemana[] = [
                'fecha'   => $fecha,
                'dia'     => Carbon::parse($fecha)->locale('es')->isoFormat('ddd'),
                'pedidos' => $dia ? $dia->pedidos : 0,
                'ventas'  => $dia ? (float) $dia->ventas : 0,
            ];
        }

        // ── Productos más vendidos (top 10 del mes) ───────────────────
        $topProductos = PedidoItem::select(
                'nombre',
                DB::raw('SUM(cantidad) as total_vendido'),
                DB::raw('ROUND(SUM(subtotal), 2) as total_ingresos')
            )
            ->whereHas('pedido', function ($q) use ($inicioMes) {
                $q->where('estado', 'entregado')
                  ->whereDate('created_at', '>=', $inicioMes);
            })
            ->groupBy('nombre')
            ->orderByDesc('total_vendido')
            ->limit(10)
            ->get();

        // ── Tipo entrega hoy ──────────────────────────────────────────
        $domicilioHoy = $pedidosHoy->where('tipo_entrega', 'domicilio')->count();
        $recogidaHoy = $pedidosHoy->where('tipo_entrega', 'recogida')->count();

        // ── Métodos de pago hoy (entregados) ──────────────────────────
        $porMetodoPago = $entregadosHoy
            ->groupBy('metodo_pago')
            ->map(fn($grupo) => [
                'count' => $grupo->count(),
                'total' => round($grupo->sum('total'), 2),
            ]);

        return response()->json([
            // Hoy
            'hoy' => [
                'total_pedidos'  => $pedidosHoy->count(),
                'ventas'         => $ventasHoy,
                'ticket_medio'   => $ticketMedioHoy,
                'entregados'     => $entregadosHoy->count(),
                'por_estado'     => $porEstado,
                'domicilio'      => $domicilioHoy,
                'recogida'       => $recogidaHoy,
                'por_metodo_pago' => $porMetodoPago,
            ],
            // Mes
            'mes' => [
                'ventas'       => $ventasMes,
                'pedidos'      => $pedidosMes,
                'ticket_medio' => $ticketMedioMes,
            ],
            // Gráfico semanal
            'ventas_semana' => $diasSemana,
            // Top productos
            'top_productos' => $topProductos,
        ]);
    }
}
