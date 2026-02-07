<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ingrediente;
use App\Models\CategoriaIngrediente;

class IngredienteSeeder extends Seeder
{
    public function run(): void
    {
        $cat = CategoriaIngrediente::pluck('id', 'nombre');

        Ingrediente::insert([
            ['nombre' => 'Masa clásica', 'categoria_id' => $cat['Masas'],     'activo' => 1],
            ['nombre' => 'Mozzarella',  'categoria_id' => $cat['Quesos'],    'activo' => 1],
            ['nombre' => 'Jamón',       'categoria_id' => $cat['Carnes'],    'activo' => 1],
            ['nombre' => 'Champiñón',   'categoria_id' => $cat['Vegetales'], 'activo' => 1],
        ]);
    }
}
