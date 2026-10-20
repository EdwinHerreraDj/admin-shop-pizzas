<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Miniaturas WebP ligeras para la tienda.
 *
 * Las fotos de los artículos se suben como PNG/JPG grandes (≈600 KB) y en la
 * tienda se muestran a ~200 px. Aquí se genera una copia WebP de 400 px
 * (≈30 KB) junto a la original, que nunca se modifica.
 *
 *   articulos/abc.png  →  articulos/miniaturas/abc.webp
 */
class MiniaturaImagen
{
    public const LADO_MAXIMO = 400;
    public const CALIDAD = 80;

    private const DISCO = 'public';

    public static function ruta(string $original): string
    {
        $carpeta = trim(dirname($original), './');
        $nombre = pathinfo($original, PATHINFO_FILENAME);

        return ($carpeta !== '' ? $carpeta . '/' : '') . 'miniaturas/' . $nombre . '.webp';
    }

    public static function existe(?string $original): bool
    {
        return $original && Storage::disk(self::DISCO)->exists(self::ruta($original));
    }

    /**
     * URL pública de la miniatura, o de la original si aún no hay miniatura.
     */
    public static function url(?string $original): ?string
    {
        if (! $original) {
            return null;
        }

        return asset('storage/' . (self::existe($original) ? self::ruta($original) : $original));
    }

    /**
     * Genera (o regenera) la miniatura. Devuelve su ruta o null si no se pudo:
     * un fallo aquí nunca debe impedir guardar el artículo.
     */
    public static function generar(?string $original): ?string
    {
        if (! $original || ! function_exists('imagewebp')) {
            return null;
        }

        $disco = Storage::disk(self::DISCO);

        try {
            if (! $disco->exists($original)) {
                return null;
            }

            $origen = @imagecreatefromstring($disco->get($original));
            if (! $origen) {
                return null;
            }

            $ancho = imagesx($origen);
            $alto = imagesy($origen);
            $escala = min(1, self::LADO_MAXIMO / max($ancho, $alto)); // nunca agrandar
            $nuevoAncho = max(1, (int) round($ancho * $escala));
            $nuevoAlto = max(1, (int) round($alto * $escala));

            $destino = imagecreatetruecolor($nuevoAncho, $nuevoAlto);
            // Conservar la transparencia de los PNG
            imagealphablending($destino, false);
            imagesavealpha($destino, true);
            imagefill($destino, 0, 0, imagecolorallocatealpha($destino, 0, 0, 0, 127));

            imagecopyresampled($destino, $origen, 0, 0, 0, 0, $nuevoAncho, $nuevoAlto, $ancho, $alto);

            ob_start();
            imagewebp($destino, null, self::CALIDAD);
            $webp = ob_get_clean();

            imagedestroy($origen);
            imagedestroy($destino);

            if (! $webp) {
                return null;
            }

            $ruta = self::ruta($original);
            $disco->put($ruta, $webp);

            return $ruta;
        } catch (Throwable $e) {
            Log::warning('No se pudo generar la miniatura', ['imagen' => $original, 'error' => $e->getMessage()]);

            return null;
        }
    }

    public static function eliminar(?string $original): void
    {
        if ($original) {
            Storage::disk(self::DISCO)->delete(self::ruta($original));
        }
    }
}
