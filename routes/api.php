<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\TipoProductoController;
use App\Http\Controllers\Api\Admin\TamanoController;
use App\Http\Controllers\Api\Admin\CategoriaIngredienteController;
use App\Http\Controllers\Api\Admin\IngredienteController;
use App\Http\Controllers\Api\Admin\IngredientePrecioController;
use App\Http\Controllers\Api\Admin\ArticuloController;
use App\Http\Controllers\Api\Admin\ArticuloPrecioController;
use App\Http\Controllers\Api\Admin\ArticuloIngredienteController;
use App\Http\Controllers\Api\Admin\ArticuloCategoriaController;
use App\Http\Controllers\Api\Admin\CategoriaArticuloController;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::prefix('admin')->group(function () {
    Route::apiResource('tipos-producto', TipoProductoController::class);
    Route::apiResource('tamanos', TamanoController::class);
    Route::apiResource('categorias-ingredientes', CategoriaIngredienteController::class);
    Route::apiResource('ingredientes', IngredienteController::class);
    Route::apiResource('ingrediente-precios', IngredientePrecioController::class);
    Route::apiResource('articulos', ArticuloController::class);
    Route::apiResource('articulo-precios', ArticuloPrecioController::class);


    /* Articulo Ingredientes */
    Route::get(
        'articulos/{articulo}/ingredientes',
        [ArticuloIngredienteController::class, 'index']
    );

    Route::post(
        'articulos/{articulo}/ingredientes',
        [ArticuloIngredienteController::class, 'store']
    );

    Route::delete(
        'articulos/{articulo}/ingredientes/{ingrediente}',
        [ArticuloIngredienteController::class, 'destroy']
    );

    /* Ingredientes */
    Route::get(
        'ingredientes/{ingrediente}/precios',
        [IngredientePrecioController::class, 'byIngrediente']
    );

    Route::post(
        'ingredientes/{ingrediente}/precios',
        [IngredientePrecioController::class, 'storeByIngrediente']
    );

    Route::get(
        'articulos/{articulo}/ingredientes-config',
        [ArticuloIngredienteController::class, 'ingredientesConfig']
    );

    Route::post(
        'articulos/{articulo}/sync-ingredientes',
        [ArticuloIngredienteController::class, 'syncIngredientes']
    );


    /* Categorías de Artículos */

    Route::get('categorias-articulos', [CategoriaArticuloController::class, 'index']);
    Route::post('categorias-articulos', [CategoriaArticuloController::class, 'store']);
    Route::put('categorias-articulos/{categoriaArticulo}', [CategoriaArticuloController::class, 'update']);
    Route::delete('categorias-articulos/{categoriaArticulo}', [CategoriaArticuloController::class, 'destroy']);




    Route::get(
        'articulos/{articulo}/categorias',
        [ArticuloCategoriaController::class, 'index']
    );

    Route::post(
        'articulos/{articulo}/categorias',
        [ArticuloCategoriaController::class, 'sync']
    );


    /* Orden de los articulos en cada categoria */
    Route::get(
        'categorias-articulos/{categoria}/articulos',
        [CategoriaArticuloController::class, 'articulos']
    );

    Route::post(
        'categorias-articulos/{categoria}/orden',
        [CategoriaArticuloController::class, 'guardarOrden']
    );
});
