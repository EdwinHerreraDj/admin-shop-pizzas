<?php

namespace App\Services;

use App\Models\Articulo;
use App\Models\ArticuloPrecio;
use App\Models\Ingrediente;
use App\Models\IngredientePrecio;
use App\Models\Tamano;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CartValidator
{
    /**
     * Resultado validado listo para persistir.
     *
     * [
     *   'items'    => [ ...items calculados ],
     *   'subtotal' => float,
     * ]
     */
    public function validate(array $items): array
    {
        if (empty($items)) {
            $this->fail('items', 'El carrito está vacío.');
        }

        $validated  = [];
        $subtotal   = 0;
        $tieneComida = false;

        foreach ($items as $index => $item) {
            $prefix = "items.{$index}";

            // ── 1. Detectar tipo — validado por StorePedidoRequest ─────────
            $esMitades = $item['tipo'] === 'pizza-mitades';

            // ── 2. Cantidad ────────────────────────────────────────────────
            $cantidad = (int) ($item['cantidad'] ?? 0);
            if ($cantidad < 1) {
                $this->fail("{$prefix}.cantidad", 'La cantidad debe ser al menos 1.');
            }

            if ($esMitades) {
                // Las mitades son siempre comida
                $tieneComida = true;

                $itemCalculado = $this->procesarMitades(
                    $item,
                    $prefix,
                    $cantidad
                );
            } else {
                // ── Artículo simple: validar raíz ──────────────────────────
                $articulo = Articulo::with([
                    'tipoProducto',
                    'precios',
                    'ingredientes',
                ])->find($item['articuloId'] ?? null);

                if (! $articulo) {
                    $this->fail("{$prefix}.articuloId", 'Artículo no encontrado.');
                }

                if (! $articulo->publicado) {
                    $this->fail("{$prefix}.articuloId", "El artículo «{$articulo->nombre}» no está disponible.");
                }

                // Comprobar si el artículo es comida
                if (! $tieneComida) {
                    $tieneComida = $articulo->categorias()
                        ->where('es_comida', true)
                        ->exists();
                }

                $itemCalculado = $this->procesarArticuloSimple(
                    $articulo,
                    $item,
                    $prefix,
                    $cantidad
                );
            }

            $subtotal   += $itemCalculado['subtotal'];
            $validated[] = $itemCalculado;
        }

        if (! $tieneComida) {
            $this->fail('items', 'El pedido debe incluir al menos un artículo de comida.');
        }

        return [
            'items'    => $validated,
            'subtotal' => round($subtotal, 2),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Artículo simple (no mitades)
    // ─────────────────────────────────────────────────────────────────────────

    private function procesarArticuloSimple(
        Articulo $articulo,
        array $item,
        string $prefix,
        int $cantidad
    ): array {
        // ── Tamaño ─────────────────────────────────────────────────────────
        $tamano      = null;
        $tamanoNombre = null;
        $precioBase  = $this->resolverPrecioArticulo($articulo, $item, $prefix, $tamano, $tamanoNombre);

        // ── Extras / quitados ──────────────────────────────────────────────
        [$ingredientesValidados, $precioExtras] = $this->procesarIngredientes(
            $articulo,
            $item,
            $prefix,
            $tamano
        );

        $precioExtrasRedondeado = round($precioExtras, 2);
        $precioUnitario         = round($precioBase + $precioExtrasRedondeado, 2);
        $subtotal               = round($precioUnitario * $cantidad, 2);

        return [
            'articulo_id'     => $articulo->id,
            'nombre'          => $articulo->nombre,
            'tamano'          => $tamanoNombre,
            'cantidad'        => $cantidad,
            'precio_base'     => round($precioBase, 2),
            'precio_extras'   => $precioExtrasRedondeado,
            'precio_unitario' => $precioUnitario,
            'subtotal'        => $subtotal,
            'ingredientes'    => $ingredientesValidados,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pizza por mitades
    // ─────────────────────────────────────────────────────────────────────────

    private function procesarMitades(array $item, string $prefix, int $cantidad): array
    {
        // El frontend envía: { tipo:"pizza-mitades", mitades:{ mitadA:{...}, mitadB:{...} } }
        $mitades    = $item['mitades'] ?? [];
        $mitadAData = $mitades['mitadA'] ?? null;
        $mitadBData = $mitades['mitadB'] ?? null;

        if (! $mitadAData || ! $mitadBData) {
            $this->fail("{$prefix}.mitades", 'La pizza por mitades requiere mitadA y mitadB.');
        }

        // Cada mitad debe indicar articuloId y tamanoId (deben ser el mismo tamaño)
        $articuloA = Articulo::with(['tipoProducto', 'precios', 'ingredientes'])
            ->find($mitadAData['articuloId'] ?? null);
        $articuloB = Articulo::with(['tipoProducto', 'precios', 'ingredientes'])
            ->find($mitadBData['articuloId'] ?? null);

        if (! $articuloA) {
            $this->fail("{$prefix}.mitadA.articuloId", 'Artículo de mitad A no encontrado.');
        }
        if (! $articuloB) {
            $this->fail("{$prefix}.mitadB.articuloId", 'Artículo de mitad B no encontrado.');
        }

        // Fix #2: validar que ambas mitades estén publicadas
        if (! $articuloA->publicado) {
            $this->fail("{$prefix}.mitadA.articuloId", "El artículo «{$articuloA->nombre}» no está disponible.");
        }
        if (! $articuloB->publicado) {
            $this->fail("{$prefix}.mitadB.articuloId", "El artículo «{$articuloB->nombre}» no está disponible.");
        }

        // El tamano debe ser el mismo para ambas mitades
        $tamanoIdA = $mitadAData['tamanoId'] ?? null;
        $tamanoIdB = $mitadBData['tamanoId'] ?? null;

        if ($tamanoIdA !== $tamanoIdB) {
            $this->fail("{$prefix}.mitadB.tamanoId", 'Ambas mitades deben tener el mismo tamaño.');
        }

        $tamanoA      = null;
        $tamanoNombreA = null;
        $precioBaseA  = $this->resolverPrecioArticulo($articuloA, $mitadAData, "{$prefix}.mitadA", $tamanoA, $tamanoNombreA);

        $tamanoB      = null;
        $tamanoNombreB = null;
        $precioBaseB  = $this->resolverPrecioArticulo($articuloB, $mitadBData, "{$prefix}.mitadB", $tamanoB, $tamanoNombreB);

        // Extras por mitad
        [$ingredientesA, $precioExtrasA] = $this->procesarIngredientes(
            $articuloA,
            $mitadAData,
            "{$prefix}.mitadA",
            $tamanoA
        );
        [$ingredientesB, $precioExtrasB] = $this->procesarIngredientes(
            $articuloB,
            $mitadBData,
            "{$prefix}.mitadB",
            $tamanoB
        );

        // Fix #1: marcar a qué mitad pertenece cada ingrediente (crítico para cocina y comandas)
        foreach ($ingredientesA as &$ing) {
            $ing['mitad'] = 'A';
        }
        foreach ($ingredientesB as &$ing) {
            $ing['mitad'] = 'B';
        }
        unset($ing); // limpiar referencia del foreach

        // Fix #1: precio BASE se promedia, extras se SUMAN (cada mitad paga sus propios extras)
        // Ejemplo: mitadA extras=4€, mitadB extras=0€ → precio_extras = 4€ (no 2€)
        $precioBaseMitades   = round(($precioBaseA + $precioBaseB) / 2, 2);
        $precioExtrasMitades = round($precioExtrasA + $precioExtrasB, 2);

        // Fix #3: usar valores ya redondeados para evitar acumulación de floats
        $precioUnitario = round($precioBaseMitades + $precioExtrasMitades, 2);
        $subtotal       = round($precioUnitario * $cantidad, 2);

        return [
            'articulo_id'     => $articuloA->id,
            'nombre'          => "{$articuloA->nombre} / {$articuloB->nombre}",
            'tamano'          => $tamanoNombreA,
            'cantidad'        => $cantidad,
            'precio_base'     => $precioBaseMitades,
            'precio_extras'   => $precioExtrasMitades,
            'precio_unitario' => $precioUnitario,
            'subtotal'        => $subtotal,
            'ingredientes'    => [...$ingredientesA, ...$ingredientesB],
            'es_mitades'      => true,
            'mitad_a'         => [
                'articulo_id' => $articuloA->id,
                'nombre'      => $articuloA->nombre,
                'ingredientes' => $ingredientesA,
            ],
            'mitad_b'         => [
                'articulo_id' => $articuloB->id,
                'nombre'      => $articuloB->nombre,
                'ingredientes' => $ingredientesB,
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Resolver precio base del artículo (con o sin tamaño)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Busca ArticuloPrecio para el artículo + tamaño indicados.
     * Rellena $tamano y $tamanoNombre por referencia.
     * Devuelve el precio base (float).
     */
    private function resolverPrecioArticulo(
        Articulo $articulo,
        array $itemData,
        string $prefix,
        ?Tamano &$tamano,
        ?string &$tamanoNombre
    ): float {
        $tamanoId = $itemData['tamanoId'] ?? null;

        if ($tamanoId) {
            $tamanoModel = Tamano::find($tamanoId);
            if (! $tamanoModel) {
                $this->fail("{$prefix}.tamanoId", 'Tamaño no encontrado.');
            }

            $articuloPrecio = $articulo->precios()
                ->where('tamano_id', $tamanoId)
                ->first();

            if (! $articuloPrecio) {
                $this->fail(
                    "{$prefix}.tamanoId",
                    "No existe precio para «{$articulo->nombre}» en el tamaño indicado."
                );
            }

            $tamano      = $tamanoModel;
            $tamanoNombre = $tamanoModel->nombre;

            return (float) $articuloPrecio->precio;
        }

        // Sin tamaño: debe existir un único precio sin tamano_id
        $articuloPrecio = $articulo->precios()->whereNull('tamano_id')->first();

        if (! $articuloPrecio) {
            // Fallback: si solo hay un precio, lo usamos
            $articuloPrecio = $articulo->precios()->first();
        }

        if (! $articuloPrecio) {
            $this->fail("{$prefix}.articuloId", "El artículo «{$articulo->nombre}» no tiene precio configurado.");
        }

        return (float) $articuloPrecio->precio;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Procesar ingredientes extras y quitados
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Valida los extras e ingredientes quitados contra la BD.
     * Devuelve [$ingredientesValidados, $totalExtras].
     */
    private function procesarIngredientes(
        Articulo $articulo,
        array $itemData,
        string $prefix,
        ?Tamano $tamano
    ): array {
        $extras   = $itemData['ingredientesExtras']   ?? [];
        $quitados = $itemData['ingredientesQuitados'] ?? [];

        $ingredientesValidados = [];
        $totalExtras           = 0.0;

        // Mapa de ingredientes activos permitidos en este artículo (fix #10 + #4)
        $permitidos = $articulo->ingredientes
            ->where('activo', true)
            ->keyBy('id');

        // ── Extras ────────────────────────────────────────────────────────
        foreach ($extras as $i => $extra) {
            $ingredienteId = $extra['ingredienteId'] ?? null;
            $cantidad      = (int) ($extra['cantidad'] ?? 1);
            $extraPrefix   = "{$prefix}.ingredientesExtras.{$i}";

            $ingrediente = $permitidos->get($ingredienteId);

            if (! $ingrediente) {
                $this->fail("{$extraPrefix}.ingredienteId", 'Ingrediente extra no permitido en este artículo.');
            }

            // Fix #4: solo se puede añadir como extra si el pivot lo permite
            if ($ingrediente->pivot->modo !== 'extra') {
                $this->fail(
                    "{$extraPrefix}.ingredienteId",
                    "El ingrediente «{$ingrediente->nombre}» no puede añadirse como extra."
                );
            }

            // Validar max_cantidad del pivot
            $maxCantidad = $ingrediente->pivot->max_cantidad ?? null;
            if ($maxCantidad && $cantidad > $maxCantidad) {
                $this->fail("{$extraPrefix}.cantidad", "Cantidad máxima para «{$ingrediente->nombre}» es {$maxCantidad}.");
            }

            // Precio del extra: buscar por tipo_producto + tamano
            $precio = $this->resolverPrecioIngrediente($ingrediente, $articulo, $tamano, $extraPrefix);

            $totalExtras += $precio * $cantidad;

            $ingredientesValidados[] = [
                'ingrediente_id' => $ingredienteId,
                'tipo'           => 'extra',
                'cantidad'       => $cantidad,
                'precio'         => round($precio, 2),
            ];
        }

        // ── Quitados ──────────────────────────────────────────────────────
        foreach ($quitados as $i => $quitado) {
            $ingredienteId = $quitado['ingredienteId'] ?? null;
            $quitadoPrefix = "{$prefix}.ingredientesQuitados.{$i}";

            $ingrediente = $permitidos->get($ingredienteId);

            if (! $ingrediente) {
                $this->fail("{$quitadoPrefix}.ingredienteId", 'Ingrediente a quitar no pertenece a este artículo.');
            }

            // Solo tiene sentido quitar lo que viene incluido (base o incluido_por_defecto)
            if ($ingrediente->pivot->modo !== 'base' && ! $ingrediente->pivot->incluido_por_defecto) {
                $this->fail(
                    "{$quitadoPrefix}.ingredienteId",
                    "El ingrediente «{$ingrediente->nombre}» no viene incluido en este artículo."
                );
            }

            $ingredientesValidados[] = [
                'ingrediente_id' => $ingredienteId,
                'tipo'           => 'quitado',
                'cantidad'       => 1,
                'precio'         => 0.00,
            ];
        }

        return [$ingredientesValidados, $totalExtras];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Precio de un ingrediente extra
    // ─────────────────────────────────────────────────────────────────────────

    private function resolverPrecioIngrediente(
        Ingrediente $ingrediente,
        Articulo $articulo,
        ?Tamano $tamano,
        string $prefix
    ): float {
        $query = IngredientePrecio::where('ingrediente_id', $ingrediente->id)
            ->where('tipo_producto_id', $articulo->tipo_producto_id);

        if ($tamano) {
            $query->where('tamano_id', $tamano->id);
        } else {
            $query->whereNull('tamano_id');
        }

        $precio = $query->first();

        if (! $precio) {
            // Fallback: buscar sin filtro de tamaño (precio genérico)
            $precio = IngredientePrecio::where('ingrediente_id', $ingrediente->id)
                ->where('tipo_producto_id', $articulo->tipo_producto_id)
                ->first();
        }

        if (! $precio) {
            $this->fail(
                "{$prefix}.ingredienteId",
                "No hay precio configurado para el extra «{$ingrediente->nombre}»."
            );
        }

        return (float) $precio->precio;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: lanzar ValidationException
    // ─────────────────────────────────────────────────────────────────────────

    private function fail(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => $message]);
    }
}
