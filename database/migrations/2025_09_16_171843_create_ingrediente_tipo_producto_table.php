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
        Schema::create('ingrediente_tipo_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingrediente_id')->constrained('ingredientes')->cascadeOnDelete();
            $table->foreignId('tipo_producto_id')->constrained('tipos_productos')->cascadeOnDelete();

            // Precios aplicables SOLO si el tipo de producto es Pizza
            $table->decimal('precio_extra_pequena', 8, 2)->nullable();
            $table->decimal('precio_extra_mediana', 8, 2)->nullable();
            $table->decimal('precio_extra_grande', 8, 2)->nullable();

            // Precio único para otros tipos de producto (bocadillos, roscas, hamburguesas…)
            $table->decimal('precio_extra_unico', 8, 2)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingrediente_tipo_producto');
    }
};
