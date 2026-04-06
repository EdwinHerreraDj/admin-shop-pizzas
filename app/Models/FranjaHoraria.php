<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FranjaHoraria extends Model
{
    protected $table = 'franjas_horarias';

    protected $fillable = [
        'dia_semana',
        'hora_apertura',
        'hora_cierre',
        'activo',
    ];

    protected $casts = [
        'dia_semana' => 'integer',
        'activo' => 'boolean',
    ];

    // 0 = lunes … 6 = domingo
    public const DIAS = [
        0 => 'Lunes',
        1 => 'Martes',
        2 => 'Miércoles',
        3 => 'Jueves',
        4 => 'Viernes',
        5 => 'Sábado',
        6 => 'Domingo',
    ];

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    public function scopeDelDia($query, int $dia)
    {
        return $query->where('dia_semana', $dia);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getNombreDiaAttribute(): string
    {
        return self::DIAS[$this->dia_semana] ?? '?';
    }
}
