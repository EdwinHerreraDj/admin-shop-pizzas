<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PedidoItemIngrediente extends Model
{
    use HasFactory;

    protected $table = 'pedido_item_ingredientes';

    protected $fillable = [
        'pedido_item_id',
        'ingrediente_id',
        'tipo',
        'mitad',
        'cantidad',
        'precio',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio' => 'decimal:2',
    ];


    public function item()
    {
        return $this->belongsTo(PedidoItem::class, 'pedido_item_id');
    }

    public function pedidoItem()
    {
        return $this->belongsTo(PedidoItem::class, 'pedido_item_id');
    }

    public function ingrediente()
    {
        return $this->belongsTo(Ingrediente::class, 'ingrediente_id');
    }
}
