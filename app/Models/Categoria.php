<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categoria_models';

    protected $fillable = [
        'nombre',
    ];

    public function articulos()
    {
        return $this->hasMany(Articulo::class, 'categoria_id');
    }
}
