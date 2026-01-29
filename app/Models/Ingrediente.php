<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingrediente extends Model
{
    protected $fillable = [
        'nombre',
        'categoria',
    ];

    // 🔹 Relación: un ingrediente puede estar en muchos artículos
    public function articulos()
    {
        return $this->belongsToMany(Articulo::class, 'producto_ingredientes', 'ingrediente_id', 'producto_id')
            ->withTimestamps();
    }

    // 🔹 Relación: un ingrediente puede aplicarse a varios tipos de producto
    // con precios personalizados
    public function tiposProductos()
    {
        return $this->belongsToMany(TipoProducto::class, 'ingrediente_tipo_producto')
            ->withPivot([
                'precio_extra_pequena',
                'precio_extra_mediana',
                'precio_extra_grande',
                'precio_extra_unico',
            ])
            ->withTimestamps();
    }

    // Para que el campo "precios" se exponga como atributo
    protected $appends = ['precios'];

    /**
     * Devuelve los precios por tipo de producto listos para el frontend
     */
    public function getPreciosAttribute()
    {
        return $this->tiposProductos->mapWithKeys(function ($tipo) {
            return [
                $tipo->id => [
                    'pequena' => $tipo->pivot->precio_extra_pequena,
                    'mediana' => $tipo->pivot->precio_extra_mediana,
                    'grande' => $tipo->pivot->precio_extra_grande,
                    'unico' => $tipo->pivot->precio_extra_unico,
                ],
            ];
        });
    }
}
