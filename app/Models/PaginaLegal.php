<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaginaLegal extends Model
{
    protected $table = 'paginas_legales';

    protected $fillable = [
        'slug',
        'titulo',
        'contenido',
        'orden',
        'activa',
    ];

    protected $casts = [
        'orden'  => 'integer',
        'activa' => 'boolean',
    ];
}
