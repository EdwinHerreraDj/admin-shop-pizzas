<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tamano;

class TamanoSeeder extends Seeder
{
    public function run(): void
    {
        Tamano::insert([
            ['nombre' => 'Pequeña', 'orden' => 1],
            ['nombre' => 'Mediana', 'orden' => 2],
            ['nombre' => 'Grande',  'orden' => 3],
        ]);
    }
}
