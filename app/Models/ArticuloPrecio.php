<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticuloPrecio extends Model
{
    protected $table = 'articulo_precios';

    protected $fillable = [
        'articulo_id',
        'tamano_id',
        'precio',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function articulo(): BelongsTo
    {
        return $this->belongsTo(Articulo::class, 'articulo_id');
    }

    public function tamano(): BelongsTo
    {
        return $this->belongsTo(Tamano::class, 'tamano_id');
    }
}
