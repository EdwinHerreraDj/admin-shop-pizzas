<?php

namespace Tests\Feature;

use App\Models\Articulo;
use App\Models\User;
use App\Services\MiniaturaImagen;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MiniaturasArticulosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        if (! function_exists('imagewebp')) {
            $this->markTestSkipped('GD sin soporte WebP');
        }
    }

    /** PNG de prueba (con transparencia) del tamaño indicado */
    private function png(int $ancho, int $alto): string
    {
        $img = imagecreatetruecolor($ancho, $alto);
        imagesavealpha($img, true);
        imagefill($img, 0, 0, imagecolorallocatealpha($img, 0, 0, 0, 127));
        imagefilledellipse($img, intdiv($ancho, 2), intdiv($alto, 2), $ancho - 20, $alto - 20, imagecolorallocate($img, 230, 120, 40));
        ob_start();
        imagepng($img);
        imagedestroy($img);

        return ob_get_clean();
    }

    public function test_genera_una_miniatura_webp_mas_pequena_y_no_toca_la_original(): void
    {
        Storage::disk('public')->put('articulos/pizza.png', $original = $this->png(500, 500));

        $ruta = MiniaturaImagen::generar('articulos/pizza.png');

        $this->assertSame('articulos/miniaturas/pizza.webp', $ruta);
        $webp = Storage::disk('public')->get($ruta);
        $info = getimagesizefromstring($webp);
        $this->assertSame('image/webp', $info['mime']);
        $this->assertSame([400, 400], [$info[0], $info[1]]);
        $this->assertSame($original, Storage::disk('public')->get('articulos/pizza.png'));
    }

    public function test_mantiene_la_proporcion_y_no_agranda_imagenes_pequenas(): void
    {
        Storage::disk('public')->put('articulos/ancha.png', $this->png(800, 400));
        Storage::disk('public')->put('articulos/mini.png', $this->png(200, 150));

        $ancha = getimagesizefromstring(Storage::disk('public')->get(MiniaturaImagen::generar('articulos/ancha.png')));
        $mini = getimagesizefromstring(Storage::disk('public')->get(MiniaturaImagen::generar('articulos/mini.png')));

        $this->assertSame([400, 200], [$ancha[0], $ancha[1]]);
        $this->assertSame([200, 150], [$mini[0], $mini[1]]);
    }

    public function test_url_usa_la_original_si_aun_no_hay_miniatura(): void
    {
        Storage::disk('public')->put('articulos/sin.png', $this->png(100, 100));

        $this->assertStringEndsWith('storage/articulos/sin.png', MiniaturaImagen::url('articulos/sin.png'));

        MiniaturaImagen::generar('articulos/sin.png');
        $this->assertStringEndsWith('storage/articulos/miniaturas/sin.webp', MiniaturaImagen::url('articulos/sin.png'));
        $this->assertNull(MiniaturaImagen::url(null));
    }

    public function test_una_imagen_corrupta_no_rompe_nada(): void
    {
        Storage::disk('public')->put('articulos/rota.png', 'esto no es una imagen');

        $this->assertNull(MiniaturaImagen::generar('articulos/rota.png'));
        $this->assertNull(MiniaturaImagen::generar('articulos/no-existe.png'));
    }

    public function test_al_subir_una_foto_desde_el_panel_se_crea_su_miniatura(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'password' => 'password']);
        $foto = UploadedFile::fake()->createWithContent('pizza.png', $this->png(500, 500));

        $this->actingAs($admin)
            ->withHeaders(['Referer' => rtrim(config('app.url'), '/') . '/admin', 'Accept' => 'application/json'])
            ->post('/api/admin/articulos', ['nombre' => 'Pizza de prueba', 'imagen' => $foto])
            ->assertSuccessful();

        $articulo = Articulo::where('nombre', 'Pizza de prueba')->firstOrFail();
        Storage::disk('public')->assertExists($articulo->imagen);
        Storage::disk('public')->assertExists(MiniaturaImagen::ruta($articulo->imagen));
    }

    public function test_el_comando_genera_las_que_faltan_sin_duplicar(): void
    {
        Storage::disk('public')->put('articulos/a.png', $this->png(500, 500));
        Storage::disk('public')->put('articulos/b.png', $this->png(500, 500));
        Articulo::forceCreate(['nombre' => 'A', 'imagen' => 'articulos/a.png', 'publicado' => true, 'orden' => 1]);
        Articulo::forceCreate(['nombre' => 'B', 'imagen' => 'articulos/b.png', 'publicado' => true, 'orden' => 2]);
        MiniaturaImagen::generar('articulos/a.png');

        $this->artisan('articulos:miniaturas')
            ->expectsOutputToContain('Miniaturas creadas: 1 · ya existían: 1')
            ->assertSuccessful();

        Storage::disk('public')->assertExists('articulos/miniaturas/b.webp');
    }

    public function test_la_api_de_la_tienda_devuelve_la_miniatura(): void
    {
        Storage::disk('public')->put('articulos/c.png', $this->png(500, 500));
        Articulo::forceCreate(['nombre' => 'C', 'imagen' => 'articulos/c.png', 'publicado' => true, 'orden' => 1]);
        MiniaturaImagen::generar('articulos/c.png');

        $item = $this->getJson('/api/shop/articulos')->assertOk()->json('data.0');

        $this->assertStringEndsWith('storage/articulos/c.png', $item['imagen']);
        $this->assertStringEndsWith('storage/articulos/miniaturas/c.webp', $item['imagen_miniatura']);
    }
}
