<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaIngrediente extends Model
{
    protected $table = 'categorias_ingredientes';

    protected $fillable = [
        'nombre',
        'orden',
        'activo',
    ];

    protected $casts = [
        'orden' => 'integer',
        'activo' => 'boolean',
    ];

    public function ingredientes(): HasMany
    {
        return $this->hasMany(Ingrediente::class, 'categoria_id');
    }
}
