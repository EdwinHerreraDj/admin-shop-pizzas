<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Migración de datos: el panel cocina ahora solo gestiona 3 estados
 * (pendiente → aceptado → en_camino). Los estados intermedios
 * 'en_preparacion' y 'listo' siguen siendo válidos en el enum para
 * pedidos históricos, pero los pedidos vivos en esos estados se mueven
 * a 'aceptado' para que sigan siendo gestionables desde el panel.
 *
 * Solo afecta pedidos NO entregados/cancelados (la historia se respeta).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('pedidos')
            ->whereIn('estado', ['en_preparacion', 'listo'])
            ->update(['estado' => 'aceptado']);
    }

    public function down(): void
    {
        // No se revierte: no podemos saber a qué estado original
        // pertenecía cada pedido tras el update.
    }
};
