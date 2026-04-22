<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $existe = DB::table('paginas_legales')->where('slug', 'alergenos')->exists();
        if ($existe) {
            return;
        }

        DB::table('paginas_legales')->insert([
            'slug'       => 'alergenos',
            'titulo'     => 'Información de Alérgenos',
            'contenido'  => '',
            'orden'      => 6,
            'activa'     => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('paginas_legales')->where('slug', 'alergenos')->delete();
    }
};
