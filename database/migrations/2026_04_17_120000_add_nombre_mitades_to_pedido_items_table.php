<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedido_items', function (Blueprint $table) {
            $table->string('nombre_mitad_a')->nullable()->after('nombre');
            $table->string('nombre_mitad_b')->nullable()->after('nombre_mitad_a');
        });
    }

    public function down(): void
    {
        Schema::table('pedido_items', function (Blueprint $table) {
            $table->dropColumn(['nombre_mitad_a', 'nombre_mitad_b']);
        });
    }
};
