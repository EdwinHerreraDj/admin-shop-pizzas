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
        Schema::create('ingrediente_precios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ingrediente_id')
                ->constrained('ingredientes')
                ->cascadeOnDelete();

            $table->foreignId('tipo_producto_id')
                ->constrained('tipos_producto')
                ->cascadeOnDelete();

            $table->foreignId('tamano_id')
                ->constrained('tamanos')
                ->cascadeOnDelete();

            $table->decimal('precio', 8, 2);
            $table->timestamps();

            $table->unique(
                ['ingrediente_id', 'tipo_producto_id', 'tamano_id'],
                'uniq_ing_precio'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingrediente_precios');
    }
};
