<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tamano extends Model
{
    protected $table = 'tamanos';

    protected $fillable = [
        'nombre',
        'slug',
        'orden',
        'activo',
    ];

    protected $casts = [
        'orden' => 'integer',
        'activo' => 'boolean',
    ];

    public function articuloPrecios(): HasMany
    {
        return $this->hasMany(ArticuloPrecio::class, 'tamano_id');
    }

    public function ingredientePrecios(): HasMany
    {
        return $this->hasMany(IngredientePrecio::class, 'tamano_id');
    }
}
