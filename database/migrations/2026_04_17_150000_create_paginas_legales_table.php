<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paginas_legales', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();       // terminos, privacidad, cookies, aviso-legal, devoluciones
            $table->string('titulo');
            $table->text('contenido')->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        // Páginas por defecto (vacías, el admin las rellena)
        $ahora = now();
        DB::table('paginas_legales')->insert([
            ['slug' => 'terminos',      'titulo' => 'Términos y Condiciones',  'contenido' => '', 'orden' => 1, 'activa' => true, 'created_at' => $ahora, 'updated_at' => $ahora],
            ['slug' => 'privacidad',    'titulo' => 'Política de Privacidad',  'contenido' => '', 'orden' => 2, 'activa' => true, 'created_at' => $ahora, 'updated_at' => $ahora],
            ['slug' => 'cookies',       'titulo' => 'Política de Cookies',     'contenido' => '', 'orden' => 3, 'activa' => true, 'created_at' => $ahora, 'updated_at' => $ahora],
            ['slug' => 'aviso-legal',   'titulo' => 'Aviso Legal',             'contenido' => '', 'orden' => 4, 'activa' => true, 'created_at' => $ahora, 'updated_at' => $ahora],
            ['slug' => 'devoluciones',  'titulo' => 'Política de Devoluciones','contenido' => '', 'orden' => 5, 'activa' => true, 'created_at' => $ahora, 'updated_at' => $ahora],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('paginas_legales');
    }
};
