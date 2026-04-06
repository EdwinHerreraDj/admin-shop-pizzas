<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MetodoPagoSeeder extends Seeder
{
    public function run(): void
    {
        $metodos = [
            ['clave' => 'efectivo',      'nombre' => 'Efectivo',              'icono' => '💵', 'activo_domicilio' => true, 'activo_recogida' => true],
            ['clave' => 'tarjeta',       'nombre' => 'Tarjeta',              'icono' => '💳', 'activo_domicilio' => true, 'activo_recogida' => true],
            ['clave' => 'transferencia', 'nombre' => 'Transferencia bancaria', 'icono' => '🏦', 'activo_domicilio' => true, 'activo_recogida' => true],
        ];

        foreach ($metodos as $metodo) {
            DB::table('metodos_pago')->updateOrInsert(
                ['clave' => $metodo['clave']],
                array_merge($metodo, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
