<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PasarelaConfigController extends Controller
{
    /**
     * Claves de configuración de Redsys.
     */
    private const CLAVES = [
        'redsys_entorno',          // 'test' | 'produccion'
        'redsys_activo',           // '1' | '0'
        'redsys_merchant_code',    // Código de comercio (FUC)
        'redsys_terminal',         // Número de terminal
        'redsys_secret_key',       // Clave secreta SHA-256
        'redsys_moneda',           // '978' = EUR
        'redsys_tipo_transaccion', // '0' = Autorización
        'redsys_nombre_comercio',  // Nombre que ve el cliente
        'redsys_url_ok',           // URL de la tienda React tras pago OK
        'redsys_url_ko',           // URL de la tienda React tras pago KO
    ];

    /**
     * Leer toda la configuración de la pasarela.
     */
    public function show(): JsonResponse
    {
        $config = [];

        foreach (self::CLAVES as $clave) {
            $config[$clave] = Configuracion::get($clave, $this->valorPorDefecto($clave));
        }

        // Nunca enviar la clave secreta completa al frontend
        if (!empty($config['redsys_secret_key'])) {
            $config['redsys_secret_key_masked'] = str_repeat('•', 8) . substr($config['redsys_secret_key'], -4);
            $config['redsys_secret_key_set'] = true;
        } else {
            $config['redsys_secret_key_masked'] = '';
            $config['redsys_secret_key_set'] = false;
        }
        unset($config['redsys_secret_key']);

        return response()->json($config);
    }

    /**
     * Guardar la configuración de la pasarela.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'redsys_entorno'          => ['required', 'string', 'in:test,produccion'],
            'redsys_activo'           => ['required', 'boolean'],
            'redsys_merchant_code'    => ['nullable', 'string', 'max:15'],
            'redsys_terminal'         => ['nullable', 'string', 'max:5'],
            'redsys_secret_key'       => ['nullable', 'string', 'max:255'],
            'redsys_moneda'           => ['nullable', 'string', 'max:5'],
            'redsys_tipo_transaccion' => ['nullable', 'string', 'max:2'],
            'redsys_nombre_comercio'  => ['nullable', 'string', 'max:100'],
            'redsys_url_ok'           => ['nullable', 'url', 'max:255'],
            'redsys_url_ko'           => ['nullable', 'url', 'max:255'],
        ]);

        foreach ($data as $clave => $valor) {
            // Si la clave secreta viene vacía, no la sobrescribimos
            if ($clave === 'redsys_secret_key' && empty($valor)) {
                continue;
            }

            Configuracion::set($clave, $valor === true ? '1' : ($valor === false ? '0' : $valor));
        }

        return response()->json(['message' => 'Configuración guardada correctamente.']);
    }

    /**
     * Verificar el estado de la conexión con Redsys.
     */
    public function test(): JsonResponse
    {
        $entorno = Configuracion::get('redsys_entorno', 'test');
        $merchantCode = Configuracion::get('redsys_merchant_code');
        $terminal = Configuracion::get('redsys_terminal');
        $secretKey = Configuracion::get('redsys_secret_key');

        $errores = [];

        if (empty($merchantCode)) {
            $errores[] = 'Falta el código de comercio (FUC).';
        }
        if (empty($terminal)) {
            $errores[] = 'Falta el número de terminal.';
        }
        if (empty($secretKey)) {
            $errores[] = 'Falta la clave secreta.';
        }
        if (empty(Configuracion::get('redsys_url_ok'))) {
            $errores[] = 'Falta la URL de retorno OK de la tienda.';
        }
        if (empty(Configuracion::get('redsys_url_ko'))) {
            $errores[] = 'Falta la URL de retorno KO de la tienda.';
        }

        if (count($errores) > 0) {
            return response()->json([
                'ok'      => false,
                'entorno' => $entorno,
                'errores' => $errores,
            ]);
        }

        return response()->json([
            'ok'      => true,
            'entorno' => $entorno,
            'message' => 'Configuración completa. La pasarela está lista para ' .
                         ($entorno === 'test' ? 'pruebas.' : 'producción.'),
        ]);
    }

    private function valorPorDefecto(string $clave): ?string
    {
        return match ($clave) {
            'redsys_entorno'          => 'test',
            'redsys_activo'           => '0',
            'redsys_moneda'           => '978',
            'redsys_tipo_transaccion' => '0',
            'redsys_terminal'         => '1',
            default                   => null,
        };
    }
}
