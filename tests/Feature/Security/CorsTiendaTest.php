<?php

namespace Tests\Feature\Security;

use Tests\TestCase;

/**
 * La tienda React vive en otro dominio: el navegador hace un preflight (OPTIONS)
 * antes de cada llamada porque axios envía X-Requested-With. Si el dominio no
 * está autorizado, toda la tienda deja de cargar.
 */
class CorsTiendaTest extends TestCase
{
    public static function origenesTienda(): array
    {
        return [
            'dominio'     => ['https://pizzeriacasadecampo.es'],
            'dominio www' => ['https://www.pizzeriacasadecampo.es'],
        ];
    }

    /** @dataProvider origenesTienda */
    public function test_el_preflight_desde_la_tienda_autoriza_el_origen(string $origen): void
    {
        $this->call('OPTIONS', '/api/shop/categorias', [], [], [], [
            'HTTP_ORIGIN'                         => $origen,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD'  => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'x-requested-with',
        ])
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', $origen);
    }

    public function test_un_origen_desconocido_no_queda_autorizado(): void
    {
        $respuesta = $this->call('OPTIONS', '/api/shop/categorias', [], [], [], [
            'HTTP_ORIGIN'                        => 'https://sitio-ajeno.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);

        $this->assertFalse($respuesta->headers->has('Access-Control-Allow-Origin'));
    }
}
