<?php

namespace Tests\Feature\Security;

/**
 * La tienda React (otro dominio) y Redsys (servidor a servidor) deben seguir
 * funcionando sin sesión ni token CSRF, aunque la verificación CSRF esté activa.
 */
class ShopApiPublicaTest extends SecurityTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->activarCsrf();
    }

    public static function rutasPublicas(): array
    {
        return [
            'estado tienda'    => ['/api/shop/estado-tienda'],
            'empresa'          => ['/api/shop/empresa'],
            'abierto ahora'    => ['/api/shop/abierto-ahora'],
            'horario semanal'  => ['/api/shop/horario-semanal'],
            'articulos'        => ['/api/shop/articulos'],
            'categorias'       => ['/api/shop/categorias'],
            'zonas envio'      => ['/api/shop/zonas-envio'],
            'franjas horarias' => ['/api/shop/franjas-horarias'],
            'metodos pago'     => ['/api/shop/metodos-pago'],
        ];
    }

    /** @dataProvider rutasPublicas */
    public function test_consultas_publicas_de_la_tienda_responden_sin_sesion(string $uri): void
    {
        $this->desdeTienda()->getJson($uri)->assertOk();
    }

    public function test_consultar_estado_de_un_pedido_no_exige_sesion(): void
    {
        $status = $this->desdeTienda()->getJson('/api/shop/pedidos/NOEXISTE')->status();

        $this->assertNotContains($status, [401, 403, 419]);
    }

    public function test_crear_pedido_desde_la_tienda_no_exige_sesion_ni_csrf(): void
    {
        // Payload vacío: debe llegar al controlador y fallar por validación, no por auth/CSRF.
        $this->desdeTienda()->postJson('/api/shop/pedidos', [])->assertUnprocessable();
    }

    public function test_notificacion_redsys_llega_al_controlador_sin_sesion_ni_csrf(): void
    {
        // Redsys llama servidor a servidor, sin Origin/Referer ni cookies.
        // Con firma inválida el controlador responde KO 400, no 401/419.
        $this->post('/api/shop/redsys/notificacion', [
            'Ds_SignatureVersion'   => 'HMAC_SHA256_V1',
            'Ds_MerchantParameters' => base64_encode('{}'),
            'Ds_Signature'          => 'firma-invalida',
        ])->assertStatus(400)->assertSeeText('KO');
    }
}
