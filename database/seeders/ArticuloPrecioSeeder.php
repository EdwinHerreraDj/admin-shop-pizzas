<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Articulo;
use App\Models\Tamano;
use App\Models\ArticuloPrecio;

class ArticuloPrecioSeeder extends Seeder
{
    public function run(): void
    {
        $articulo = Articulo::first();

        foreach (Tamano::all() as $tamano) {
            ArticuloPrecio::create([
                'articulo_id' => $articulo->id,
                'tamano_id' => $tamano->id,
                'precio' => match ($tamano->nombre) {
                    'Pequeña' => 7,
                    'Mediana' => 9,
                    'Grande'  => 11,
                },
            ]);
        }
    }
}
