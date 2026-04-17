<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias_articulos', function (Blueprint $table) {
            $table->boolean('es_comida')->default(true)->after('activo');
        });

        // Marcar bebidas como no-comida
        DB::table('categorias_articulos')
            ->whereIn('nombre', ['Refrescos', 'Cervezas', 'Vinos'])
            ->update(['es_comida' => false]);
    }

    public function down(): void
    {
        Schema::table('categorias_articulos', function (Blueprint $table) {
            $table->dropColumn('es_comida');
        });
    }
};
