<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticuloIngrediente extends Model
{
    protected $table = 'articulo_ingredientes';

    protected $fillable = [
        'articulo_id',
        'ingrediente_id',
        'tipo',
        'incluido_por_defecto',
        'obligatorio',
        'max_cantidad',
    ];

    protected $casts = [
        'incluido_por_defecto' => 'boolean',
        'obligatorio' => 'boolean',
        'max_cantidad' => 'integer',
    ];

    public function articulo(): BelongsTo
    {
        return $this->belongsTo(Articulo::class, 'articulo_id');
    }

    public function ingrediente(): BelongsTo
    {
        return $this->belongsTo(Ingrediente::class, 'ingrediente_id');
    }
}
