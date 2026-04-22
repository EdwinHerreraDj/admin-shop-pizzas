<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\Pedido;
use App\Services\RedsysService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RedsysController extends Controller
{
    public function __construct(private RedsysService $redsys) {}

    /**
     * POST /api/shop/pedidos/{codigo}/redsys/iniciar
     *
     * Llamado por la tienda tras crear un pedido con método de pago 'tarjeta'.
     * Devuelve los parámetros firmados para montar el <form> al TPV.
     */
    public function iniciar(string $codigo): JsonResponse
    {
        $pedido = Pedido::where('codigo', $codigo)->firstOrFail();

        if ($pedido->metodo_pago !== 'tarjeta') {
            return response()->json([
                'message' => 'Este pedido no usa pago con tarjeta.',
            ], 422);
        }

        if ($pedido->estado_pago === 'pagado') {
            return response()->json([
                'message' => 'Este pedido ya está pagado.',
            ], 422);
        }

        if ($pedido->estado === 'cancelado') {
            return response()->json([
                'message' => 'Este pedido está cancelado.',
            ], 422);
        }

        if ((string) Configuracion::get('redsys_activo', '0') !== '1') {
            return response()->json([
                'message' => 'La pasarela de pago no está activa.',
            ], 503);
        }

        $datos = $this->redsys->prepararFormulario($pedido);

        return response()->json($datos);
    }

    /**
     * POST /api/shop/redsys/notificacion
     *
     * Callback asíncrono server-to-server desde Redsys.
     * SIN auth, SIN CSRF (la ruta se registra fuera del grupo web).
     * La autenticidad se comprueba con la firma HMAC_SHA256_V1.
     */
    public function notificacion(Request $request)
    {
        $payload = $request->all();
        $datos = $this->redsys->verificarNotificacion($payload);

        if (!$datos) {
            Log::warning('Redsys notificación con firma inválida o payload incompleto', [
                'payload' => $payload,
            ]);
            return response('KO', 400);
        }

        $order        = $datos['Ds_Order'] ?? $datos['DS_ORDER'] ?? null;
        $responseCode = $datos['Ds_Response'] ?? $datos['DS_RESPONSE'] ?? null;
        $authCode     = $datos['Ds_AuthorisationCode'] ?? $datos['DS_AUTHORISATIONCODE'] ?? null;

        $pedido = Pedido::where('ds_order', $order)->first();

        if (!$pedido) {
            Log::warning('Redsys notificación para ds_order inexistente', ['ds_order' => $order]);
            return response('OK', 200);
        }

        // Evitamos re-procesar notificaciones duplicadas (Redsys puede reintentar).
        if ($pedido->estado_pago === 'pagado') {
            return response('OK', 200);
        }

        // Redsys considera autorizado si Ds_Response es numérico entre 0000 y 0099.
        $codigoNumerico = is_numeric($responseCode) ? (int) $responseCode : null;
        $autorizado     = $codigoNumerico !== null && $codigoNumerico >= 0 && $codigoNumerico <= 99;

        DB::transaction(function () use ($pedido, $datos, $responseCode, $authCode, $autorizado) {
            $pedido->ds_response_code      = $responseCode;
            $pedido->ds_authorisation_code = $authCode;
            $pedido->ds_transaction_date   = now();
            $pedido->ds_raw_notification   = $datos;

            if ($autorizado) {
                $pedido->estado_pago = 'pagado';
                if ($pedido->estado === 'pendiente_pago') {
                    $pedido->estado = 'pendiente';
                }
            } else {
                $pedido->estado_pago = 'fallido';
            }

            $pedido->save();
        });

        return response('OK', 200);
    }

    /**
     * GET /api/shop/pedidos/{codigo}/pago-estado
     *
     * La tienda consulta este endpoint en /pago/ok para confirmar que la
     * notificación asíncrona ya llegó y el pedido está realmente pagado.
     */
    public function estadoPago(string $codigo): JsonResponse
    {
        $pedido = Pedido::where('codigo', $codigo)
            ->select('codigo', 'estado', 'estado_pago', 'ds_response_code', 'total')
            ->firstOrFail();

        return response()->json($pedido);
    }
}
