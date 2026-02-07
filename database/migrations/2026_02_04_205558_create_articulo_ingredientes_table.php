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
        Schema::create('articulo_ingredientes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('articulo_id')
                ->constrained('articulos')
                ->cascadeOnDelete();

            $table->foreignId('ingrediente_id')
                ->constrained('ingredientes')
                ->cascadeOnDelete();

            $table->enum('modo', ['base', 'extra']);
            $table->boolean('incluido_por_defecto')->default(false);
            $table->boolean('obligatorio')->default(false);
            $table->unsignedInteger('max_cantidad')->nullable();

            $table->timestamps();

            $table->unique(['articulo_id', 'ingrediente_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articulo_ingredientes');
    }
};
