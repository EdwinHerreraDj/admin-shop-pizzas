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
        Schema::table('zonas_envio', function (Blueprint $table) {
            $table->decimal('pedido_minimo', 8, 2)->default(0)->after('recargo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zonas_envio', function (Blueprint $table) {
            $table->dropColumn('pedido_minimo');
        });
    }
};
