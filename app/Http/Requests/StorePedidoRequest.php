<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Cliente ───────────────────────────────────────────────────
            'cliente'                       => ['required', 'array'],
            'cliente.nombre'                => ['required', 'string', 'max:255'],
            'cliente.telefono'              => ['required', 'string', 'max:20'],
            'cliente.direccion'             => ['required', 'string', 'max:500'],
            'cliente.codigo_postal'         => ['required', 'string', 'max:10'],

            // ── Pago ──────────────────────────────────────────────────────
            'metodo_pago'                   => ['required', 'string', 'in:efectivo,tarjeta,transferencia'],

            // ── Observaciones ─────────────────────────────────────────────
            'observaciones'                 => ['nullable', 'string', 'max:1000'],

            // ── Items ─────────────────────────────────────────────────────
            'items'                         => ['required', 'array', 'min:1'],
            'items.*.cantidad'              => ['required', 'integer', 'min:1', 'max:99'],

            // Fix #2: tipo es obligatorio, CartValidator lo usa para detectar mitades
            'items.*.tipo'                  => ['required', 'string', 'in:articulo,pizza-mitades'],

            // ── Artículo simple ───────────────────────────────────────────
            // articuloId solo es obligatorio cuando no es pizza-mitades
            'items.*.articuloId'            => ['nullable', 'integer'],
            'items.*.tamanoId'              => ['nullable', 'integer'],

            // Fix #3: ingredientes del artículo simple
            'items.*.ingredientesExtras'                        => ['nullable', 'array'],
            'items.*.ingredientesExtras.*.ingredienteId'        => ['required', 'integer'],
            'items.*.ingredientesExtras.*.cantidad'             => ['nullable', 'integer', 'min:1'],

            'items.*.ingredientesQuitados'                      => ['nullable', 'array'],
            'items.*.ingredientesQuitados.*.ingredienteId'      => ['required', 'integer'],

            // ── Pizza por mitades ─────────────────────────────────────────
            // Fix #1: estructura real es items.*.mitades.mitadA / mitadB
            'items.*.mitades'                                   => ['nullable', 'array'],

            'items.*.mitades.mitadA'                            => ['nullable', 'array'],
            'items.*.mitades.mitadA.articuloId'                 => ['required_with:items.*.mitades.mitadA', 'integer'],
            'items.*.mitades.mitadA.tamanoId'                   => ['required_with:items.*.mitades.mitadA', 'integer'],
            'items.*.mitades.mitadA.ingredientesExtras'         => ['nullable', 'array'],
            'items.*.mitades.mitadA.ingredientesExtras.*.ingredienteId' => ['required', 'integer'],
            'items.*.mitades.mitadA.ingredientesExtras.*.cantidad'      => ['nullable', 'integer', 'min:1'],
            'items.*.mitades.mitadA.ingredientesQuitados'               => ['nullable', 'array'],
            'items.*.mitades.mitadA.ingredientesQuitados.*.ingredienteId' => ['required', 'integer'],

            'items.*.mitades.mitadB'                            => ['nullable', 'array'],
            'items.*.mitades.mitadB.articuloId'                 => ['required_with:items.*.mitades.mitadB', 'integer'],
            'items.*.mitades.mitadB.tamanoId'                   => ['required_with:items.*.mitades.mitadB', 'integer'],
            'items.*.mitades.mitadB.ingredientesExtras'         => ['nullable', 'array'],
            'items.*.mitades.mitadB.ingredientesExtras.*.ingredienteId' => ['required', 'integer'],
            'items.*.mitades.mitadB.ingredientesExtras.*.cantidad'      => ['nullable', 'integer', 'min:1'],
            'items.*.mitades.mitadB.ingredientesQuitados'               => ['nullable', 'array'],
            'items.*.mitades.mitadB.ingredientesQuitados.*.ingredienteId' => ['required', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente.nombre.required'           => 'El nombre del cliente es obligatorio.',
            'cliente.telefono.required'         => 'El teléfono del cliente es obligatorio.',
            'cliente.direccion.required'        => 'La dirección es obligatoria.',
            'cliente.codigo_postal.required'    => 'El código postal es obligatorio.',
            'metodo_pago.required'              => 'El método de pago es obligatorio.',
            'metodo_pago.in'                    => 'Método de pago no válido. Usa: efectivo, tarjeta o transferencia.',
            'items.required'                    => 'El pedido debe contener al menos un artículo.',
            'items.min'                         => 'El pedido debe contener al menos un artículo.',
            'items.*.tipo.required'             => 'Cada item debe indicar su tipo (articulo o pizza-mitades).',
            'items.*.tipo.in'                   => 'Tipo de item no válido.',
            'items.*.cantidad.min'              => 'La cantidad mínima por artículo es 1.',
            'items.*.cantidad.max'              => 'La cantidad máxima por artículo es 99.',
        ];
    }

    /**
     * Validaciones condicionales que dependen del valor de otros campos.
     * Las reglas de FormRequest no permiten expresar "required si tipo=articulo",
     * así que lo hacemos aquí.
     */
    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $v) {
            $items = $this->input('items', []);

            foreach ($items as $i => $item) {
                $tipo = $item['tipo'] ?? null;

                if ($tipo === 'articulo' && empty($item['articuloId'])) {
                    $v->errors()->add(
                        "items.{$i}.articuloId",
                        'El articuloId es obligatorio para items de tipo articulo.'
                    );
                }

                if ($tipo === 'pizza-mitades' && empty($item['mitades'])) {
                    $v->errors()->add(
                        "items.{$i}.mitades",
                        'Las pizzas por mitades deben incluir mitadA y mitadB.'
                    );
                }
            }
        });
    }
}
