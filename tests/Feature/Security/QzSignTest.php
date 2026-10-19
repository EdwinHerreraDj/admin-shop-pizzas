<?php

namespace Tests\Feature\Security;

class QzSignTest extends SecurityTestCase
{
    public function test_firmar_sin_sesion_devuelve_401(): void
    {
        $this->usarClaveQzDePrueba();

        $this->postJson('/api/qz/sign', ['request' => 'abc'])->assertUnauthorized();
        $this->desdePanel()->postJson('/api/qz/sign', ['request' => 'abc'])->assertUnauthorized();
    }

    public function test_firmar_sin_accept_json_devuelve_401_en_vez_de_redirigir(): void
    {
        // El fetch de qzPrinter.js envía Accept: text/plain
        $this->usarClaveQzDePrueba();

        $this->post('/api/qz/sign', ['request' => 'abc'], ['Accept' => 'text/plain'])
            ->assertUnauthorized();
    }

    public function test_roles_sin_acceso_no_pueden_firmar(): void
    {
        $this->usarClaveQzDePrueba();

        foreach (['user', 'guest'] as $role) {
            $this->actingAs($this->usuario($role))
                ->desdePanel()
                ->postJson('/api/qz/sign', ['request' => 'abc'])
                ->assertForbidden();
        }
    }

    public function test_cocina_y_admin_firman_con_csrf_como_qz_printer(): void
    {
        $clave = $this->usarClaveQzDePrueba();
        $publica = openssl_pkey_get_details(openssl_pkey_get_private($clave))['key'];
        $this->activarCsrf();

        foreach (['cocina', 'admin', 'super_admin'] as $role) {
            $respuesta = $this->actingAs($this->usuario($role))
                ->withSession(['_token' => 'token-de-prueba'])
                ->withHeaders([
                    'Referer'      => rtrim(config('app.url'), '/') . '/admin/cocina',
                    'Accept'       => 'text/plain',
                    'X-CSRF-TOKEN' => 'token-de-prueba',
                ])
                ->postJson('/api/qz/sign', ['request' => 'mensaje-a-firmar']);

            $respuesta->assertOk();

            $firma = base64_decode($respuesta->getContent());
            $this->assertSame(1, openssl_verify('mensaje-a-firmar', $firma, $publica, OPENSSL_ALGO_SHA512));
        }
    }

    public function test_el_certificado_publico_sigue_accesible(): void
    {
        $this->usarClaveQzDePrueba();

        $this->get('/api/qz/certificate')
            ->assertOk()
            ->assertSeeText('CERTIFICADO-DE-PRUEBA');
    }
}
