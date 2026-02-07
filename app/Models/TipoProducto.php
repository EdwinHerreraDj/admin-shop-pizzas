<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoProducto extends Model
{
    protected $table = 'tipos_producto';

    protected $fillable = [
        'nombre',
        'usa_tamanos',
    ];

    protected $casts = [
        'usa_tamanos' => 'boolean',
    ];

    public function articulos(): HasMany
    {
        return $this->hasMany(Articulo::class, 'tipo_producto_id');
    }

    public function ingredientePrecios(): HasMany
    {
        return $this->hasMany(IngredientePrecio::class, 'tipo_producto_id');
    }

    public function tamanos()
    {
        return $this->belongsToMany(
            Tamano::class,
            'tipo_producto_tamano'
        );
    }
}
