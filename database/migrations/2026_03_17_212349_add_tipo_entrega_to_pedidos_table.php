<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->enum('tipo_entrega', ['domicilio', 'recogida'])
                ->default('domicilio')
                ->after('estado')
                ->comment('domicilio = envío a dirección, recogida = cliente recoge en tienda');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('tipo_entrega');
        });
    }
};
