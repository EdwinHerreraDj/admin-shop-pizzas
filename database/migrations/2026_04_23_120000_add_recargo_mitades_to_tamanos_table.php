<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tamanos', function (Blueprint $table) {
            $table->decimal('recargo_mitades', 8, 2)->default(0)->after('orden');
        });

        // Valores por defecto coincidentes con la lógica anterior (hardcoded)
        DB::table('tamanos')->where('nombre', 'Mediana')->update(['recargo_mitades' => 1.50]);
        DB::table('tamanos')->where('nombre', 'Grande')->update(['recargo_mitades' => 2.00]);
    }

    public function down(): void
    {
        Schema::table('tamanos', function (Blueprint $table) {
            $table->dropColumn('recargo_mitades');
        });
    }
};
