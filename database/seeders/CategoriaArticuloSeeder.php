<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoriaArticulo;

class CategoriaArticuloSeeder extends Seeder
{
    public function run(): void
    {
        CategoriaArticulo::insert([
            ['nombre' => 'Pizzas',  'orden' => 1],
            ['nombre' => 'Bebidas', 'orden' => 2],
        ]);
    }
}
