<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IngredientePrecio extends Model
{
    protected $table = 'ingrediente_precios';

    protected $fillable = [
        'ingrediente_id',
        'tipo_producto_id',
        'tamano_id',
        'precio',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function ingrediente(): BelongsTo
    {
        return $this->belongsTo(Ingrediente::class);
    }

    public function tipoProducto(): BelongsTo
    {
        return $this->belongsTo(TipoProducto::class);
    }

    public function tamano(): BelongsTo
    {
        return $this->belongsTo(Tamano::class);
    }
}
