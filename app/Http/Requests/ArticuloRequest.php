<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArticuloRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'categoria_id' => 'required|exists:categoria_models,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'imagen_url' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'precio_pequena' => 'nullable|numeric|min:0',
            'precio_mediana' => 'nullable|numeric|min:0',
            'precio_grande' => 'nullable|numeric|min:0',
            'precio_unico' => 'nullable|numeric|min:0',
            'es_personalizable' => 'boolean',
            'ingredientes' => 'nullable|array',
            'ingredientes.*' => 'exists:ingredientes,id',
            'tipo_producto_id' => 'nullable|exists:tipos_productos,id',
            'publicado' => 'boolean',
        ];
    }

    public function messages()
    {
        return [
            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.exists' => 'La categoría seleccionada no es válida.',
            'nombre.required' => 'El nombre del artículo es obligatorio.',
            'nombre.max' => 'El nombre del artículo no puede exceder los 255 caracteres.',
            'imagen_url.image' => 'El archivo debe ser una imagen.',
            'imagen_url.mimes' => 'La imagen debe ser un archivo de tipo: jpg, jpeg, png, webp.',
            'imagen_url.max' => 'La imagen no debe superar los 2MB.',
            'precio_pequena.numeric' => 'El precio pequeña debe ser un número.',
            'precio_mediana.numeric' => 'El precio mediana debe ser un número.',
            'precio_grande.numeric' => 'El precio grande debe ser un número.',
            'precio_unico.numeric' => 'El precio único debe ser un número.',
            'ingredientes.array' => 'Los ingredientes deben ser un array.',
            'ingredientes.*.exists' => 'Uno o más ingredientes seleccionados no son válidos.',
            'tipo_producto_id.exists' => 'El tipo de producto seleccionado no es válido.',
            'publicado.boolean' => 'El campo publicado debe ser verdadero o falso.',
        ];
    }
}
