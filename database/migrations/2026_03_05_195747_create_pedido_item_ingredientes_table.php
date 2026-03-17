<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedido_item_ingredientes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pedido_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedBigInteger('ingrediente_id');

            $table->enum('tipo', ['extra', 'quitado']);

            $table->integer('cantidad')->default(1);

            $table->decimal('precio', 8, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedido_item_ingredientes');
    }
};
