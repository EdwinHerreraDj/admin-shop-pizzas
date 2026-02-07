<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ingrediente;
use App\Models\TipoProducto;
use App\Models\Tamano;
use App\Models\IngredientePrecio;

class IngredientePrecioSeeder extends Seeder
{
    public function run(): void
    {
        $pizza = TipoProducto::where('nombre', 'Pizza')->first();

        foreach (Ingrediente::all() as $ingrediente) {
            foreach (Tamano::all() as $tamano) {
                IngredientePrecio::create([
                    'ingrediente_id' => $ingrediente->id,
                    'tipo_producto_id' => $pizza->id,
                    'tamano_id' => $tamano->id,
                    'precio' => 1.00,
                ]);
            }
        }
    }
}
