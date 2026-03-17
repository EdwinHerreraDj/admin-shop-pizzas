<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedido_items', function (Blueprint $table) {
            // Precio base del artículo (sin extras), recalculado desde BD
            $table->decimal('precio_base', 8, 2)
                ->default(0)
                ->after('cantidad')
                ->comment('Precio base del artículo recalculado desde BD');

            // Suma de todos los extras añadidos
            $table->decimal('precio_extras', 8, 2)
                ->default(0)
                ->after('precio_base')
                ->comment('Suma de extras añadidos al item');

            // precio_unitario = precio_base + precio_extras (ya existía, se mantiene)
        });
    }

    public function down(): void
    {
        Schema::table('pedido_items', function (Blueprint $table) {
            $table->dropColumn(['precio_base', 'precio_extras']);
        });
    }
};