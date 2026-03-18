<?php

namespace App\Http\Controllers\Api\Pedido;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePedidoRequest;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\PedidoItemIngrediente;
use App\Models\ZonaEnvio;
use App\Services\CartValidator;
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

        // ── 2. Validar y recalcular carrito ───────────────────────────────
        $carrito = $this->cartValidator->validate($data['items']);

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
            $carrito
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

    public function show(Pedido $pedido): JsonResponse
    {
        $pedido->load(['items.ingredientes.ingrediente', 'zonaEnvio', 'repartidor']);

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
