<?php

namespace Database\Seeders;

use App\Models\TipoProducto;
use Illuminate\Database\Seeder;

class TipoProductoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = ['Pizza', 'Pasta', 'Hamburguesa', 'Bocadillo', 'Rosca', 'Ensalada'];
        foreach ($tipos as $tipo) {
            TipoProducto::create(['nombre' => $tipo]);
        }
    }
}
