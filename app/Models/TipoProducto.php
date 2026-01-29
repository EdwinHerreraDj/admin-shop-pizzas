<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoProducto extends Model
{
    use HasFactory;

    protected $table = 'tipos_productos';

    protected $fillable = ['nombre'];

    public function articulos()
    {
        return $this->hasMany(Articulo::class);
    }

    public function ingredientes()
    {
        return $this->belongsToMany(Ingrediente::class, 'ingrediente_tipo_producto')
            ->withPivot([
                'precio_extra_pequena',
                'precio_extra_mediana',
                'precio_extra_grande',
                'precio_extra_unico',
            ])
            ->withTimestamps();
    }
}
