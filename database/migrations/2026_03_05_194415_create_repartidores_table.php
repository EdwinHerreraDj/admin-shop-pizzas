<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up(): void
    {
        Schema::create('repartidores', function (Blueprint $table) {
            $table->id();

            $table->string('nombre');

            $table->string('telefono')->nullable();
            
            $table->string('DNI')->nullable();
            
            $table->string('email')->nullable();
            
            $table->string('direccion')->nullable();
            
            $table->string('vehiculo')->nullable();
            
            $table->string('placa')->nullable();
            
            $table->string('licencia_conducir')->nullable();
            
            $table->date('fecha_contratacion')->nullable();
            
            $table->date('fecha_nacimiento')->nullable();
            
            $table->string('foto')->nullable();

            $table->boolean('activo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repartidores');
    }
};
