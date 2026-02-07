<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingrediente extends Model
{
    protected $table = 'ingredientes';

    protected $fillable = [
        'nombre',
        'categoria_id',
        'activo',
    ];

    protected $casts = [
        'categoria_id' => 'integer',
        'activo' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaIngrediente::class, 'categoria_id');
    }

    public function precios(): HasMany
    {
        return $this->hasMany(IngredientePrecio::class, 'ingrediente_id');
    }

    public function articuloIngredientes(): HasMany
    {
        return $this->hasMany(ArticuloIngrediente::class, 'ingrediente_id');
    }
}
