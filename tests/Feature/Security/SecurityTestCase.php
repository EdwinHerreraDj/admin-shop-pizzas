<?php

namespace Tests\Feature\Security;

use App\Http\Middleware\VerifyCsrfToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

abstract class SecurityTestCase extends TestCase
{
    use RefreshDatabase;

    protected const ORIGEN_TIENDA = 'https://shoppizzas.alminares.es';

    protected ?string $storageTemporal = null;

    protected function tearDown(): void
    {
        if ($this->storageTemporal) {
            File::deleteDirectory($this->storageTemporal);
        }

        parent::tearDown();
    }

    protected function usuario(string $role): User
    {
        // Contraseña en claro: el cast 'hashed' la cifra con las rondas del entorno de test.
        return User::factory()->create(['role' => $role, 'password' => 'password']);
    }

    /**
     * Petición tal y como la hace el panel: mismo dominio que APP_URL,
     * así que Sanctum la trata como stateful (sesión + CSRF).
     */
    protected function desdePanel(): static
    {
        return $this->withHeaders([
            'Referer' => rtrim(config('app.url'), '/') . '/admin',
            'Accept'  => 'application/json',
        ]);
    }

    /**
     * Petición tal y como la hace la tienda React (otro dominio).
     */
    protected function desdeTienda(): static
    {
        return $this->withHeaders([
            'Origin'  => self::ORIGEN_TIENDA,
            'Referer' => self::ORIGEN_TIENDA . '/checkout',
            'Accept'  => 'application/json',
        ]);
    }

    /**
     * Laravel desactiva la verificación CSRF en tests; la reactivamos para
     * comprobar el comportamiento real.
     */
    protected function activarCsrf(): void
    {
        $this->app->bind(VerifyCsrfToken::class, function ($app) {
            return new class($app, $app['encrypter']) extends VerifyCsrfToken {
                protected function runningUnitTests()
                {
                    return false;
                }
            };
        });
    }

    /**
     * Storage temporal con una clave y certificado QZ de prueba,
     * para no leer ni tocar los reales de storage/app/qz.
     */
    protected function usarClaveQzDePrueba(): string
    {
        $this->storageTemporal = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'qz-test-' . uniqid();
        File::ensureDirectoryExists($this->storageTemporal . '/app/qz');

        $clave = File::get(base_path('tests/Fixtures/qz-test-private-key.pem'));
        File::put($this->storageTemporal . '/app/qz/private-key.pem', $clave);
        File::put($this->storageTemporal . '/app/qz/digital-certificate.txt', 'CERTIFICADO-DE-PRUEBA');

        $this->app->useStoragePath($this->storageTemporal);

        return $clave;
    }
}
