<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Pedido;
use App\Models\PedidoItemIngrediente;

class PedidoItem extends Model
{
    use HasFactory;

    protected $table = 'pedido_items';

    protected $fillable = [
        'pedido_id',
        'articulo_id',
        'nombre',
        'nombre_mitad_a',
        'nombre_mitad_b',
        'tamano',
        'cantidad',
        'precio_base',
        'precio_extras',
        'precio_unitario',
        'subtotal',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_base' => 'decimal:2',
        'precio_extras' => 'decimal:2',
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function ingredientes()
    {
        return $this->hasMany(PedidoItemIngrediente::class, 'pedido_item_id');
    }
}
