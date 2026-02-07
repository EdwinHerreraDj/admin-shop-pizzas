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
        Schema::create('articulo_categoria', function (Blueprint $table) {
            $table->id();

            $table->foreignId('articulo_id')
                ->constrained('articulos')
                ->cascadeOnDelete();

            $table->foreignId('categoria_articulo_id')
                ->constrained('categorias_articulos')
                ->cascadeOnDelete();

            $table->unsignedInteger('orden')->default(0);

            $table->timestamps();

            $table->unique(['articulo_id', 'categoria_articulo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articulo_categoria');
    }
};
