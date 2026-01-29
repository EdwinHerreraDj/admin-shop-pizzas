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
        Schema::create('producto_ingredientes', function (Blueprint $table) {
            $table->id();

            // Relación con productos/artículos
            $table->foreignId('producto_id')
                ->constrained('articulos')
                ->onDelete('cascade');

            // Relación con ingredientes
            $table->foreignId('ingrediente_id')
                ->constrained('ingredientes')
                ->onDelete('cascade');

            $table->timestamps();

            // evitar duplicados de ingrediente en un mismo producto
            $table->unique(['producto_id', 'ingrediente_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producto_ingredientes');
    }
};
