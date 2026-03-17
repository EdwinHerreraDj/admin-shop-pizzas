<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();

            $table->string('codigo')->unique();

            $table->string('cliente_nombre');
            $table->string('cliente_telefono');

            $table->string('direccion');
            $table->string('codigo_postal');

            $table->foreignId('zona_envio_id')
                ->constrained('zonas_envio')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->decimal('subtotal', 8, 2);
            $table->decimal('gastos_envio', 8, 2);
            $table->decimal('total', 8, 2);

            $table->string('metodo_pago');

            $table->enum('estado', [
                'pendiente',
                'aceptado',
                'en_preparacion',
                'listo',
                'en_camino',
                'entregado',
                'cancelado'
            ])->default('pendiente');

            $table->foreignId('repartidor_id')
                ->nullable()
                ->constrained('repartidores')
                ->nullOnDelete();

            $table->timestamp('hora_salida')->nullable();
            $table->timestamp('hora_entrega')->nullable();

            $table->text('observaciones')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
