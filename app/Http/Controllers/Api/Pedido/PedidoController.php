<?php

namespace App\Http\Controllers\Api\Pedido;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePedidoRequest;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\PedidoItemIngrediente;
use App\Models\FranjaHoraria;
use App\Models\MetodoPago;
use App\Models\ZonaEnvio;
use App\Services\CartValidator;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PedidoController extends Controller
{
    public function __construct(private CartValidator $cartValidator) {}

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/shop/pedidos
    // ─────────────────────────────────────────────────────────────────────────

    public function store(StorePedidoRequest $request): JsonResponse
    {
        $data         = $request->validated();
        $cliente      = $data['cliente'];
        $tipoEntrega  = $data['tipo_entrega'];
        $esRecogida   = $tipoEntrega === 'recogida';

        // ── 1. Resolver zona y gastos de envío ────────────────────────────
        $zona        = null;
        $gastosEnvio = 0.0;

        if (! $esRecogida) {
            // Buscar zona por código postal Y barrio exacto
            $zona = ZonaEnvio::activas()
                ->porCodigoPostal($cliente['codigo_postal'])
                ->where('barrio', $cliente['barrio'])
                ->first();

            if (! $zona) {
                return response()->json([
                    'message' => 'No realizamos envíos a esa zona.',
                    'errors'  => [
                        'cliente.barrio' => ['No realizamos envíos a esa zona.'],
                    ],
                ], 422);
            }

            $gastosEnvio = (float) $zona->recargo;
        }

        // ── 1.1 Validar método de pago según tipo de entrega ───────────
        $metodoPago = MetodoPago::where('clave', $data['metodo_pago'])->first();
        $campoActivo = $esRecogida ? 'activo_recogida' : 'activo_domicilio';

        if (! $metodoPago || ! $metodoPago->{$campoActivo}) {
            return response()->json([
                'message' => 'Este método de pago no está disponible para este tipo de entrega.',
                'errors'  => ['metodo_pago' => ['Este método de pago no está disponible para este tipo de entrega.']],
            ], 422);
        }

        // ── 2. Validar y recalcular carrito ───────────────────────────────
        $carrito = $this->cartValidator->validate($data['items']);

        // ── 2.1 Validar pedido mínimo de la zona ─────────────────────────
        if ($zona && $zona->pedido_minimo > 0 && $carrito['subtotal'] < (float) $zona->pedido_minimo) {
            return response()->json([
                'message' => "El pedido mínimo para esta zona es de {$zona->pedido_minimo} €.",
                'errors'  => [
                    'pedido_minimo' => ["El pedido mínimo para esta zona es de {$zona->pedido_minimo} €."],
                ],
            ], 422);
        }

        // ── 2.2 Validar hora deseada ─────────────────────────────────────
        $horaDeseada = $data['hora_deseada'] ?? null;

        if ($horaDeseada) {
            $ahora      = Carbon::now();
            $diaSemana  = $ahora->dayOfWeekIso - 1;
            $horaMinima = $ahora->copy()->addMinutes(60)->format('H:i');

            if ($horaDeseada < $horaMinima) {
                return response()->json([
                    'message' => 'La hora seleccionada debe ser al menos 1 hora desde ahora.',
                    'errors'  => ['hora_deseada' => ['La hora seleccionada debe ser al menos 1 hora desde ahora.']],
                ], 422);
            }

            $dentroFranja = FranjaHoraria::activas()
                ->delDia($diaSemana)
                ->where('hora_apertura', '<=', $horaDeseada)
                ->where('hora_cierre', '>', $horaDeseada)
                ->exists();

            if (! $dentroFranja) {
                return response()->json([
                    'message' => 'La hora seleccionada está fuera del horario de servicio.',
                    'errors'  => ['hora_deseada' => ['La hora seleccionada está fuera del horario de servicio.']],
                ], 422);
            }
        }

        // ── 3. Calcular totales ───────────────────────────────────────────
        $subtotal = $carrito['subtotal'];
        $total    = round($subtotal + $gastosEnvio, 2);

        // ── 4. Persistir en transacción ───────────────────────────────────
        $pedido = DB::transaction(function () use (
            $cliente,
            $data,
            $zona,
            $tipoEntrega,
            $esRecogida,
            $subtotal,
            $gastosEnvio,
            $total,
            $carrito,
            $horaDeseada
        ) {
            $pedido = Pedido::create([
                'codigo'           => $this->generarCodigo(),
                'estado'           => 'pendiente',
                'cliente_nombre'   => $cliente['nombre'],
                'cliente_telefono' => $cliente['telefono'],
                'direccion'        => $esRecogida ? null : $cliente['direccion'],
                'codigo_postal'    => $esRecogida ? null : $cliente['codigo_postal'],
                'zona_envio_id'    => $zona?->id,
                'subtotal'         => $subtotal,
                'gastos_envio'     => $gastosEnvio,
                'total'            => $total,
                'metodo_pago'      => $data['metodo_pago'],
                'observaciones'    => $data['observaciones'] ?? null,
                'hora_deseada'     => $horaDeseada,
                'tipo_entrega'     => $tipoEntrega,
            ]);

            foreach ($carrito['items'] as $itemData) {
                $item = PedidoItem::create([
                    'pedido_id'       => $pedido->id,
                    'articulo_id'     => $itemData['articulo_id'],
                    'nombre'          => $itemData['nombre'],
                    'tamano'          => $itemData['tamano'],
                    'cantidad'        => $itemData['cantidad'],
                    'precio_base'     => $itemData['precio_base'],
                    'precio_extras'   => $itemData['precio_extras'],
                    'precio_unitario' => $itemData['precio_unitario'],
                    'subtotal'        => $itemData['subtotal'],
                ]);

                foreach ($itemData['ingredientes'] as $ing) {
                    PedidoItemIngrediente::create([
                        'pedido_item_id' => $item->id,
                        'ingrediente_id' => $ing['ingrediente_id'],
                        'tipo'           => $ing['tipo'],
                        'mitad'          => $ing['mitad'] ?? null,
                        'cantidad'       => $ing['cantidad'],
                        'precio'         => $ing['precio'],
                    ]);
                }
            }

            return $pedido;
        });

        $pedido->load(['items.ingredientes.ingrediente', 'zonaEnvio']);

        // event(new \App\Events\PedidoCreado($pedido));

        return response()->json([
            'message' => 'Pedido creado correctamente.',
            'pedido'  => $pedido,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/shop/pedidos/{pedido}
    // ─────────────────────────────────────────────────────────────────────────

    public function show(string $codigo): JsonResponse
    {
        $pedido = Pedido::where('codigo', $codigo)
            ->with(['items.ingredientes.ingrediente', 'zonaEnvio', 'repartidor'])
            ->firstOrFail();

        return response()->json($pedido);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function generarCodigo(): string
    {
        do {
            $codigo = 'PED-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
        } while (Pedido::where('codigo', $codigo)->exists());

        return $codigo;
    }
}
