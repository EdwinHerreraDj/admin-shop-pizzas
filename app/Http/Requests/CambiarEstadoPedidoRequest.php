<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CambiarEstadoPedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => [
                'required',
                'string',
                // Valores posibles como destino en cualquier transición de cocina.
                // La validación de si la transición es legal para el estado actual
                // del pedido ocurre en el controlador (segunda capa).
                Rule::in([
                    'aceptado',
                    'en_preparacion',
                    'listo',
                    'cancelado',    // válido desde pendiente, aceptado, en_preparacion
                                    // NO válido desde listo — el controlador lo rechaza
                ]),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'estado.required' => 'El estado es obligatorio.',
            'estado.in'       => 'Estado no válido para el módulo cocina.',
        ];
    }
}