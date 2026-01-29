<?php

use App\Http\Controllers\Api\ArticuloController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/articulos', [ArticuloController::class, 'index']);
Route::get('/categorias', [ArticuloController::class, 'categorias']);
Route::get('/articulos/categoria/{id}', [ArticuloController::class, 'porCategoria']);
Route::get('/articulos/{id}/ingredientes', [ArticuloController::class, 'ingredientesConPrecios']);


// Nueva ruta para obtener ingredientes base con precios para pizzas desde cero
Route::get('/ingredientes/base', [ArticuloController::class, 'ingredientesBase']);
