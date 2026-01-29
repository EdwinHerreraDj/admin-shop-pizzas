<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IngredienteTipoProducto extends Model
{
    protected $table = 'ingrediente_tipo_producto';

    protected $fillable = [
        'ingrediente_id',
        'tipo_producto_id',
        'precio_extra_pequena',
        'precio_extra_mediana',
        'precio_extra_grande',
        'precio_extra_unico',
    ];

    protected $casts = [
        'precio_extra_pequena' => 'float',
        'precio_extra_mediana' => 'float',
        'precio_extra_grande' => 'float',
        'precio_extra_unico' => 'float',
    ];

    // 🔹 Relaciones
    public function ingredientes()
    {
        return $this->belongsToMany(Ingrediente::class, 'ingrediente_tipo_producto')
            ->withPivot(['precio_extra_pequena', 'precio_extra_mediana', 'precio_extra_grande', 'precio_extra_unico']);
    }

    public function tipoProducto()
    {
        return $this->belongsTo(TipoProducto::class);
    }
}
