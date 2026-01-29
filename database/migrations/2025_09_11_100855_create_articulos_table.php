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
            $table->foreignId('categoria_id')->constrained('categoria_models')->onDelete('cascade');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('imagen_url')->nullable();
            $table->decimal('precio_pequena', 8, 2)->nullable();
            $table->decimal('precio_mediana', 8, 2)->nullable();
            $table->decimal('precio_grande', 8, 2)->nullable();
            $table->decimal('precio_unico', 8, 2)->nullable();
            $table->boolean('es_personalizable')->default(true);
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
