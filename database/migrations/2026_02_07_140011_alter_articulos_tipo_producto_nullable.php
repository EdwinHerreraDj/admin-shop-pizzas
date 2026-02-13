<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('articulos', function (Blueprint $table) {
            // Quitamos obligatoriedad
            $table->foreignId('tipo_producto_id')
                ->nullable()
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('articulos', function (Blueprint $table) {
            // Volvemos a obligatorio (solo si todos tienen valor)
            $table->foreignId('tipo_producto_id')
                ->nullable(false)
                ->change();
        });
    }
};
