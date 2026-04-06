<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetodoPago extends Model
{
    protected $table = 'metodos_pago';

    protected $fillable = [
        'clave',
        'nombre',
        'icono',
        'activo_domicilio',
        'activo_recogida',
    ];

    protected $casts = [
        'activo_domicilio' => 'boolean',
        'activo_recogida'  => 'boolean',
    ];
}
