<?php

namespace App\Services;

use App\Models\Configuracion;
use App\Models\Pedido;
use RuntimeException;

/**
 * Integración con Redsys (TPV Virtual) usando la firma HMAC_SHA256_V1.
 *
 * Flujo:
 *  - prepararFormulario(): genera Ds_MerchantParameters + Ds_Signature + URL del TPV
 *  - verificarNotificacion(): valida la firma de la notificación asíncrona
 */
class RedsysService
{
    private const URL_TEST = 'https://sis-t.redsys.es:25443/sis/realizarPago';
    private const URL_PROD = 'https://sis.redsys.es/sis/realizarPago';
    private const SIGNATURE_VERSION = 'HMAC_SHA256_V1';

    /**
     * Prepara los datos firmados para que el frontend envíe el formulario al TPV.
     *
     * @return array{url_tpv:string, Ds_SignatureVersion:string, Ds_MerchantParameters:string, Ds_Signature:string}
     */
    public function prepararFormulario(Pedido $pedido): array
    {
        $secretKey = (string) Configuracion::get('redsys_secret_key');

        if ($secretKey === '') {
            throw new RuntimeException('La clave secreta de Redsys no está configurada.');
        }

        if (empty($pedido->ds_order)) {
            throw new RuntimeException('El pedido no tiene ds_order asignado.');
        }

        $entorno     = (string) Configuracion::get('redsys_entorno', 'test');
        $merchantCode = (string) Configuracion::get('redsys_merchant_code');
        $terminal    = (string) Configuracion::get('redsys_terminal', '1');
        $moneda      = (string) Configuracion::get('redsys_moneda', '978');
        $tipoTrans   = (string) Configuracion::get('redsys_tipo_transaccion', '0');
        $nombreCom   = (string) Configuracion::get('redsys_nombre_comercio', '');
        $urlOk       = (string) Configuracion::get('redsys_url_ok', '');
        $urlKo       = (string) Configuracion::get('redsys_url_ko', '');

        $importeCentimos = (int) round(((float) $pedido->total) * 100);

        $params = [
            'DS_MERCHANT_AMOUNT'           => (string) $importeCentimos,
            'DS_MERCHANT_ORDER'            => $pedido->ds_order,
            'DS_MERCHANT_MERCHANTCODE'     => $merchantCode,
            'DS_MERCHANT_CURRENCY'         => $moneda,
            'DS_MERCHANT_TRANSACTIONTYPE'  => $tipoTrans,
            'DS_MERCHANT_TERMINAL'         => $terminal,
            'DS_MERCHANT_MERCHANTURL'      => route('shop.redsys.notificacion'),
            'DS_MERCHANT_URLOK'            => $this->urlConCodigo($urlOk, $pedido->codigo),
            'DS_MERCHANT_URLKO'            => $this->urlConCodigo($urlKo, $pedido->codigo),
            'DS_MERCHANT_PRODUCTDESCRIPTION' => 'Pedido ' . $pedido->codigo,
        ];

        if ($nombreCom !== '') {
            $params['DS_MERCHANT_MERCHANTNAME'] = $nombreCom;
        }

        $merchantParameters = base64_encode(json_encode($params, JSON_UNESCAPED_SLASHES));
        $signature          = $this->firmar($merchantParameters, $pedido->ds_order, $secretKey);

        return [
            'url_tpv'                 => $entorno === 'produccion' ? self::URL_PROD : self::URL_TEST,
            'Ds_SignatureVersion'     => self::SIGNATURE_VERSION,
            'Ds_MerchantParameters'   => $merchantParameters,
            'Ds_Signature'            => $signature,
        ];
    }

    /**
     * Verifica la firma de una notificación asíncrona de Redsys.
     *
     * Devuelve los parámetros decodificados si la firma es válida, o null si no lo es.
     */
    public function verificarNotificacion(array $payload): ?array
    {
        $merchantParameters = $payload['Ds_MerchantParameters'] ?? null;
        $signatureRecibida  = $payload['Ds_Signature'] ?? null;

        if (!$merchantParameters || !$signatureRecibida) {
            return null;
        }

        $secretKey = (string) Configuracion::get('redsys_secret_key');
        if ($secretKey === '') {
            return null;
        }

        $decoded = json_decode(base64_decode(strtr($merchantParameters, '-_', '+/')), true);
        if (!is_array($decoded)) {
            return null;
        }

        $order = $decoded['Ds_Order'] ?? $decoded['DS_ORDER'] ?? null;
        if (!$order) {
            return null;
        }

        $firmaCalculada = $this->firmar($merchantParameters, $order, $secretKey);

        // Redsys envía la firma en base64 URL-safe ("-_"), la nuestra se genera en base64 normal ("+/").
        $firmaRecibidaNormal = strtr((string) $signatureRecibida, '-_', '+/');

        if (!hash_equals($firmaCalculada, $firmaRecibidaNormal)) {
            return null;
        }

        return $decoded;
    }

    /**
     * Genera un Ds_Order único de 12 caracteres:
     *   - 4 primeros: numéricos (requisito de Redsys)
     *   - 8 restantes: alfanuméricos
     */
    public function generarDsOrder(): string
    {
        do {
            $order = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT)
                . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            $existe = Pedido::where('ds_order', $order)->exists();
        } while ($existe);

        return $order;
    }

    /**
     * Firma HMAC_SHA256_V1.
     *
     * 1. Diversificar la clave secreta usando 3DES-CBC con IV=0 y datos=Ds_Order (zero-padded a 8 bytes).
     * 2. HMAC-SHA256 sobre Ds_MerchantParameters con la clave diversificada.
     * 3. Base64 estándar del resultado binario.
     */
    private function firmar(string $merchantParameters, string $order, string $secretKey): string
    {
        $claveBinaria = base64_decode($secretKey);
        $iv = str_repeat("\0", 8);

        $orderPadded = $order;
        $resto = strlen($orderPadded) % 8;
        if ($resto !== 0) {
            $orderPadded .= str_repeat("\0", 8 - $resto);
        }

        $claveDiversificada = openssl_encrypt(
            $orderPadded,
            'des-ede3-cbc',
            $claveBinaria,
            OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
            $iv
        );

        if ($claveDiversificada === false) {
            throw new RuntimeException('Error al diversificar la clave Redsys.');
        }

        $mac = hash_hmac('sha256', $merchantParameters, $claveDiversificada, true);

        return base64_encode($mac);
    }

    private function urlConCodigo(string $url, string $codigo): string
    {
        if ($url === '') {
            return '';
        }

        $sep = str_contains($url, '?') ? '&' : '?';
        return $url . $sep . 'codigo=' . urlencode($codigo);
    }
}
