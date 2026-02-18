<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zonas_envio', function (Blueprint $table) {
            $table->id();

            // Código postal
            $table->string('codigo_postal', 10)->index();

            // Barrio o zona concreta
            $table->string('barrio');

            // Recargo de transporte
            $table->decimal('recargo', 8, 2)->default(0);

            // Control administrativo
            $table->boolean('activo')->default(true);

            $table->timestamps();

            // Evita duplicados exactos
            $table->unique(['codigo_postal', 'barrio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zonas_envio');
    }
};
