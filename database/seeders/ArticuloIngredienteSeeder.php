<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Articulo;
use App\Models\Ingrediente;
use App\Models\ArticuloIngrediente;

class ArticuloIngredienteSeeder extends Seeder
{
    public function run(): void
    {
        $articulo = Articulo::first();

        foreach (Ingrediente::all() as $ingrediente) {
            ArticuloIngrediente::create([
                'articulo_id' => $articulo->id,
                'ingrediente_id' => $ingrediente->id,
                'modo' => 'base',
                'incluido_por_defecto' => 1,
                'obligatorio' => 0,
                'max_cantidad' => 1,
            ]);
        }
    }
}
