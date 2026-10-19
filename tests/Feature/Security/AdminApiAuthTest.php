<?php

namespace Tests\Feature\Security;

use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class AdminApiAuthTest extends SecurityTestCase
{
    public static function rutasAdmin(): array
    {
        return [
            'dashboard'              => ['GET', '/api/admin/dashboard'],
            'listar articulos'       => ['GET', '/api/admin/articulos'],
            'borrar articulo'        => ['DELETE', '/api/admin/articulos/1'],
            'leer pasarela redsys'   => ['GET', '/api/admin/configuracion/pasarela'],
            'cambiar pasarela redsys'=> ['PUT', '/api/admin/configuracion/pasarela'],
            'cerrar tienda'          => ['PUT', '/api/admin/configuracion/estado-tienda'],
            'gestion pedidos'        => ['GET', '/api/admin/gestion/pedidos'],
            'borrar pedido'          => ['DELETE', '/api/admin/gestion/pedidos/1'],
        ];
    }

    public static function rutasCocina(): array
    {
        return [
            'pedidos cocina'         => ['GET', '/api/admin/pedidos'],
            'cambiar estado cocina'  => ['PATCH', '/api/admin/pedidos/1/estado'],
            'sonido cocina'          => ['GET', '/api/admin/configuracion/sonido'],
        ];
    }

    public static function todasLasRutas(): array
    {
        return array_merge(self::rutasAdmin(), self::rutasCocina());
    }

    /** @dataProvider todasLasRutas */
    public function test_sin_sesion_devuelve_401(string $metodo, string $uri): void
    {
        $this->json($metodo, $uri)->assertUnauthorized();
    }

    /** @dataProvider todasLasRutas */
    public function test_sin_sesion_desde_el_dominio_del_panel_devuelve_401(string $metodo, string $uri): void
    {
        $this->desdePanel()->json($metodo, $uri)->assertUnauthorized();
    }

    public function test_sin_sesion_y_sin_accept_json_devuelve_401_en_vez_de_redirigir(): void
    {
        $this->get('/api/admin/dashboard', ['Accept' => 'text/html'])->assertUnauthorized();
    }

    /** @dataProvider todasLasRutas */
    public function test_roles_sin_acceso_al_panel_reciben_403(string $metodo, string $uri): void
    {
        foreach (['user', 'guest'] as $role) {
            $this->actingAs($this->usuario($role))
                ->desdePanel()
                ->json($metodo, $uri)
                ->assertForbidden();
        }
    }

    /** @dataProvider rutasAdmin */
    public function test_cocina_no_accede_a_rutas_de_administracion(string $metodo, string $uri): void
    {
        $this->actingAs($this->usuario('cocina'))
            ->desdePanel()
            ->json($metodo, $uri)
            ->assertForbidden();
    }

    public function test_cocina_accede_a_sus_endpoints(): void
    {
        $cocina = $this->usuario('cocina');

        $this->actingAs($cocina)->desdePanel()->getJson('/api/admin/pedidos')->assertOk();
        $this->actingAs($cocina)->desdePanel()->getJson('/api/admin/configuracion/sonido')->assertOk();
    }

    public function test_admin_y_super_admin_acceden_al_panel(): void
    {
        foreach (['admin', 'super_admin'] as $role) {
            $user = $this->usuario($role);

            $this->actingAs($user)->desdePanel()->getJson('/api/admin/dashboard')->assertOk();
            $this->actingAs($user)->desdePanel()->getJson('/api/admin/articulos')->assertOk();
            $this->actingAs($user)->desdePanel()->getJson('/api/admin/configuracion/pasarela')->assertOk();
            $this->actingAs($user)->desdePanel()->getJson('/api/admin/pedidos')->assertOk();
            $this->actingAs($user)->desdePanel()->getJson('/api/admin/gestion/pedidos')->assertOk();
        }
    }

    public function test_la_respuesta_de_pasarela_nunca_expone_la_clave_secreta(): void
    {
        $this->actingAs($this->usuario('admin'))
            ->desdePanel()
            ->getJson('/api/admin/configuracion/pasarela')
            ->assertOk()
            ->assertJsonMissingPath('redsys_secret_key');
    }

    /**
     * Flujo real: login por formulario → cookie de sesión → llamada a la API
     * desde el dominio del panel.
     */
    public function test_flujo_real_login_por_sesion_y_llamada_a_la_api(): void
    {
        $admin = $this->usuario('admin');

        $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
            ->assertRedirect(route('home'));

        $cookieSesion = [config('session.cookie') => session()->getId()];

        // Olvidamos el usuario en memoria: la autenticación sale solo de la cookie.
        $this->app['auth']->forgetGuards();

        $this->desdePanel()
            ->withCookies($cookieSesion)
            ->getJson('/api/admin/dashboard')
            ->assertOk();

    }

    public function test_sanctum_solo_trata_como_stateful_al_dominio_del_panel(): void
    {
        $panel  = Request::create('/api/admin/dashboard', 'GET', server: ['HTTP_REFERER' => rtrim(config('app.url'), '/') . '/admin']);
        $tienda = Request::create('/api/shop/pedidos', 'POST', server: ['HTTP_ORIGIN' => self::ORIGEN_TIENDA]);
        $redsys = Request::create('/api/shop/redsys/notificacion', 'POST');

        $this->assertTrue(EnsureFrontendRequestsAreStateful::fromFrontend($panel));
        $this->assertFalse(EnsureFrontendRequestsAreStateful::fromFrontend($tienda));
        $this->assertFalse(EnsureFrontendRequestsAreStateful::fromFrontend($redsys));
    }

    public function test_login_de_rol_sin_acceso_cierra_la_sesion(): void
    {
        $user = $this->usuario('user');

        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('login');

        $this->assertGuest();
    }

    public function test_mutacion_desde_el_panel_sin_token_csrf_devuelve_419(): void
    {
        $this->activarCsrf();

        $this->actingAs($this->usuario('admin'))
            ->desdePanel()
            ->putJson('/api/admin/configuracion/estado-tienda', ['tienda_cerrada' => false])
            ->assertStatus(419);
    }

    public function test_mutacion_desde_el_panel_con_token_csrf_funciona(): void
    {
        $this->activarCsrf();

        $this->actingAs($this->usuario('admin'))
            ->withSession(['_token' => 'token-de-prueba'])
            ->desdePanel()
            ->withHeader('X-CSRF-TOKEN', 'token-de-prueba')
            ->putJson('/api/admin/configuracion/estado-tienda', ['tienda_cerrada' => false])
            ->assertOk();
    }
}
