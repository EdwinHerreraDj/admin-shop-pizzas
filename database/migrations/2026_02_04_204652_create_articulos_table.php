<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articulos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');

            $table->foreignId('tipo_producto_id')
                ->constrained('tipos_producto');

            $table->boolean('personalizable')->default(false);
            $table->boolean('publicado')->default(true);

            // Horario (NULL = disponible siempre)
            $table->time('hora_inicio_venta')->nullable();
            $table->time('hora_fin_venta')->nullable();

            // Orden global
            $table->unsignedInteger('orden')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articulos');
    }
};
