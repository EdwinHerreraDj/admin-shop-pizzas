<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->enum('estado_pago', [
                'no_aplica',
                'pendiente',
                'pagado',
                'fallido',
                'devuelto',
            ])->default('no_aplica')->after('metodo_pago');

            $table->string('ds_order', 12)->nullable()->unique()->after('estado_pago');
            $table->string('ds_response_code', 4)->nullable()->after('ds_order');
            $table->string('ds_authorisation_code', 10)->nullable()->after('ds_response_code');
            $table->timestamp('ds_transaction_date')->nullable()->after('ds_authorisation_code');
            $table->json('ds_raw_notification')->nullable()->after('ds_transaction_date');
        });

        DB::statement("
            ALTER TABLE pedidos
            MODIFY COLUMN estado ENUM(
                'pendiente_pago',
                'pendiente',
                'aceptado',
                'en_preparacion',
                'listo',
                'en_camino',
                'entregado',
                'cancelado'
            ) NOT NULL DEFAULT 'pendiente'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE pedidos
            MODIFY COLUMN estado ENUM(
                'pendiente',
                'aceptado',
                'en_preparacion',
                'listo',
                'en_camino',
                'entregado',
                'cancelado'
            ) NOT NULL DEFAULT 'pendiente'
        ");

        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn([
                'estado_pago',
                'ds_order',
                'ds_response_code',
                'ds_authorisation_code',
                'ds_transaction_date',
                'ds_raw_notification',
            ]);
        });
    }
};
