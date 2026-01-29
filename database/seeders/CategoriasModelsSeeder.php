<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriasModelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catergorias = [
            'Pizzas',
            'Pastas',
            'Hamburguesas',
            'Bocatas',
            'Roscas',
            'Carnes',
            'Ensaladas',
            'Patatas',
            'Raciones',
            'Postres',
            'Bebidas',
        ];
        foreach ($catergorias as $categoria) {
            Categoria::create(['nombre' => $categoria]);
        }
    }
}
