<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QzTrayController extends Controller
{
    private function certPath(): string
    {
        return storage_path('app/qz/digital-certificate.txt');
    }

    private function keyPath(): string
    {
        return storage_path('app/qz/private-key.pem');
    }

    /**
     * GET /api/qz/certificate
     * Devuelve el certificado público en formato PEM.
     */
    public function certificate(): Response
    {
        $cert = file_get_contents($this->certPath());

        return response($cert, 200)
            ->header('Content-Type', 'text/plain');
    }

    /**
     * POST /api/qz/sign
     * Firma el string recibido con la clave privada.
     * QZ Tray envía { request: "string a firmar" }
     */
    public function sign(Request $request)
    {
        $request->validate([
            'request' => 'required|string',
        ]);

        $toSign    = $request->input('request');
        $keyPem    = file_get_contents($this->keyPath());
        $privateKey = openssl_pkey_get_private($keyPem);

        if (! $privateKey) {
            return response()->json([
                'error' => 'No se pudo cargar la clave privada.',
            ], 500);
        }

        $signature = '';
        $ok = openssl_sign($toSign, $signature, $privateKey, OPENSSL_ALGO_SHA512);

        if (! $ok) {
            return response()->json([
                'error' => 'Error al firmar.',
            ], 500);
        }

        return response(base64_encode($signature), 200)
            ->header('Content-Type', 'text/plain');
    }
}
