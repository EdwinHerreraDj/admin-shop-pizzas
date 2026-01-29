<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Articulo extends Model
{
    use HasFactory;

    protected $table = 'articulos';

    protected $fillable = [
        'categoria_id',
        'tipo_producto_id',
        'nombre',
        'descripcion',
        'imagen_url',
        'precio_pequena',
        'precio_mediana',
        'precio_grande',
        'precio_unico',
        'es_personalizable',
        'publicado',
    ];

    protected $casts = [
        'precio_pequena' => 'float',
        'precio_mediana' => 'float',
        'precio_grande' => 'float',
        'precio_unico' => 'float',
        'es_personalizable' => 'boolean',
        'publicado' => 'boolean',
    ];

    // Relaciones -----------------------

    /**
     * Un artículo pertenece a una categoría.
     */
    public function tipoProducto()
    {
        return $this->belongsTo(TipoProducto::class, 'tipo_producto_id');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function ingredientes()
    {
        return $this->belongsToMany(Ingrediente::class, 'producto_ingredientes', 'producto_id', 'ingrediente_id')
            ->withTimestamps();
    }
}
