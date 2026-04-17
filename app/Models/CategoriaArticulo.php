<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CategoriaArticulo extends Model
{
    protected $table = 'categorias_articulos';

    protected $fillable = [
        'nombre',
        'orden',
        'activo',
        'es_comida',
    ];

    protected $casts = [
        'orden' => 'integer',
        'activo' => 'boolean',
        'es_comida' => 'boolean',
    ];

    public function articulos(): BelongsToMany
    {
        return $this->belongsToMany(
            Articulo::class,
            'articulo_categoria',
            'categoria_articulo_id',
            'articulo_id'
        )->withPivot('orden')->withTimestamps();
    }
}
