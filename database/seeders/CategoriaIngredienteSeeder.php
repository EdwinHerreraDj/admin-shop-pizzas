<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoriaIngrediente;

class CategoriaIngredienteSeeder extends Seeder
{
    public function run(): void
    {
        CategoriaIngrediente::insert([
            ['nombre' => 'Masas',     'orden' => 1],
            ['nombre' => 'Quesos',    'orden' => 2],
            ['nombre' => 'Carnes',    'orden' => 3],
            ['nombre' => 'Vegetales', 'orden' => 4],
        ]);
    }
}
