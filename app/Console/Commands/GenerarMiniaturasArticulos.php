<?php

namespace App\Console\Commands;

use App\Models\Articulo;
use App\Services\MiniaturaImagen;
use Illuminate\Console\Command;

class GenerarMiniaturasArticulos extends Command
{
    protected $signature = 'articulos:miniaturas {--forzar : Regenera también las que ya existen}';

    protected $description = 'Genera las miniaturas WebP de las fotos de los artículos (no modifica las originales)';

    public function handle(): int
    {
        if (! function_exists('imagewebp')) {
            $this->error('PHP no tiene soporte WebP en la extensión GD. Instala/activa php-gd con WebP.');

            return self::FAILURE;
        }

        $articulos = Articulo::whereNotNull('imagen')->where('imagen', '!=', '')->get(['id', 'imagen']);
        $creadas = $omitidas = $fallidas = 0;

        $barra = $this->output->createProgressBar($articulos->count());

        foreach ($articulos as $articulo) {
            if (! $this->option('forzar') && MiniaturaImagen::existe($articulo->imagen)) {
                $omitidas++;
            } elseif (MiniaturaImagen::generar($articulo->imagen)) {
                $creadas++;
            } else {
                $fallidas++;
            }
            $barra->advance();
        }

        $barra->finish();
        $this->newLine(2);
        $this->info("Miniaturas creadas: {$creadas} · ya existían: {$omitidas} · sin imagen válida: {$fallidas}");

        return self::SUCCESS;
    }
}
