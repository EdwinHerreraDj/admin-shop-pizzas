<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\PedidoItem;
use App\Models\ZonaEnvio;
use App\Models\Repartidor;

class Pedido extends Model
{
    use HasFactory;

    protected $table = 'pedidos';

    protected $fillable = [
        'codigo',
        'estado',
        'tipo_entrega',        
        'cliente_nombre',
        'cliente_telefono',
        'direccion',
        'codigo_postal',
        'zona_envio_id',
        'subtotal',
        'gastos_envio',
        'total',
        'metodo_pago',
        'repartidor_id',
        'hora_salida',
        'hora_entrega',
        'observaciones',
    ];

    protected $casts = [
        'subtotal'     => 'decimal:2',
        'gastos_envio' => 'decimal:2',
        'total'        => 'decimal:2',
        'hora_salida'  => 'datetime',
        'hora_entrega' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(PedidoItem::class, 'pedido_id');
    }

    public function zonaEnvio()
    {
        return $this->belongsTo(ZonaEnvio::class, 'zona_envio_id');
    }

    public function repartidor()
    {
        return $this->belongsTo(Repartidor::class, 'repartidor_id');
    }
}
