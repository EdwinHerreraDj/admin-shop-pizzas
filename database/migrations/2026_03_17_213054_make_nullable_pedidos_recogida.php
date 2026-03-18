<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            // Nullable para pedidos de recogida en tienda
            $table->string('direccion')->nullable()->change();
            $table->string('codigo_postal')->nullable()->change();

            // Quitar la FK obligatoria — en recogida no hay zona de envío
            $table->dropForeign(['zona_envio_id']);
            $table->foreignId('zona_envio_id')
                ->nullable()
                ->change();
            $table->foreign('zona_envio_id')
                ->references('id')
                ->on('zonas_envio')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('direccion')->nullable(false)->change();
            $table->string('codigo_postal')->nullable(false)->change();

            $table->dropForeign(['zona_envio_id']);
            $table->foreignId('zona_envio_id')
                ->nullable(false)
                ->change();
            $table->foreign('zona_envio_id')
                ->references('id')
                ->on('zonas_envio')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }
};
