<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Repartidor extends Model
{
    use HasFactory;

    protected $table = 'repartidores';

    protected $fillable = [
        'nombre',
        'telefono',
        'activo',
        'DNI',
        'email',
        'direccion',
        'vehiculo',
        'placa',
        'licencia_conducir',
        'fecha_contratacion',
        'fecha_nacimiento',
        'foto',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_contratacion' => 'datetime',
        'fecha_nacimiento' => 'datetime',   
    ];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'repartidor_id');
    }
}