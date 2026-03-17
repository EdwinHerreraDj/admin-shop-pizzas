<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZonaEnvio extends Model
{
    protected $table = 'zonas_envio';

    protected $fillable = [
        'codigo_postal',
        'barrio',
        'recargo',
        'activo',
    ];

    protected $casts = [
        'recargo' => 'decimal:2',
        'activo' => 'boolean',
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

    public function scopePorCodigoPostal($query, $codigo)
    {
        return $query->where('codigo_postal', $codigo);
    }

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'zona_envio_id');
    }
}
