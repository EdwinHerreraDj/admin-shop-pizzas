<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Articulo extends Model
{
    protected $table = 'articulos';

    protected $fillable = [
        'tipo_producto_id',
        'nombre',
        'personalizable',
        'publicado',
        'orden',
        'hora_inicio_venta',
        'hora_fin_venta',
        'descripcion',
        'imagen',
    ];

    protected $appends = ['imagen_url'];

    protected $casts = [
        'tipo_producto_id' => 'integer',
        'personalizable' => 'boolean',
        'publicado' => 'boolean',
        'orden' => 'integer',
    ];


    public function tipoProducto(): BelongsTo
    {
        return $this->belongsTo(TipoProducto::class, 'tipo_producto_id');
    }

    public function precios(): HasMany
    {
        return $this->hasMany(ArticuloPrecio::class, 'articulo_id');
    }

    public function ingredientes()
    {
        return $this->belongsToMany(
            Ingrediente::class,
            'articulo_ingredientes',
            'articulo_id',
            'ingrediente_id'
        )->withPivot([
            'modo',
            'incluido_por_defecto',
            'obligatorio',
            'max_cantidad'
        ]);
    }


    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(
            CategoriaArticulo::class,
            'articulo_categoria',
            'articulo_id',
            'categoria_articulo_id'
        )->withPivot('orden')->withTimestamps();
    }
    public function getImagenUrlAttribute()
    {
        return $this->imagen
            ? asset('storage/' . $this->imagen)
            : null;
    }
}
