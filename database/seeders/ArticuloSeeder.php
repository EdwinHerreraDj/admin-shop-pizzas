<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Articulo;
use App\Models\TipoProducto;
use App\Models\CategoriaArticulo;

class ArticuloSeeder extends Seeder
{
    public function run(): void
    {
        $pizza = TipoProducto::where('nombre', 'Pizza')->first();
        $categoria = CategoriaArticulo::where('nombre', 'Pizzas')->first();

        $articulo = Articulo::create([
            'nombre' => 'Pizza Margarita',
            'tipo_producto_id' => $pizza->id,
            'personalizable' => 1,
            'publicado' => 1,
            'orden' => 1,
        ]);

        $articulo->categorias()->attach($categoria->id);
    }
}
