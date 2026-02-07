<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoProducto;

class TipoProductoSeeder extends Seeder
{
    public function run(): void
    {
        TipoProducto::insert([
            [
                'nombre' => 'Pizza',
                'usa_tamanos' => 1,
            ],
            [
                'nombre' => 'Bebida',
                'usa_tamanos' => 0,
            ],
        ]);
    }
}
