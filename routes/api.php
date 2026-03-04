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
use App\Http\Controllers\Api\Admin\ZonaEnvioController;
use App\Http\Controllers\Api\Shop\ArticuloPublicController;
use App\Http\Controllers\Api\Shop\CategoriaPublicController;
use App\Http\Controllers\Api\Shop\PizzaPlantillaController;
use App\Http\Controllers\Api\Shop\PizzasExistentesController;


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


    /* Precios de los articulos */
    Route::get(
        'articulos/{articulo}/precios',
        [ArticuloPrecioController::class, 'index']
    );

    Route::put(
        'articulos/{articulo}/precios',
        [ArticuloPrecioController::class, 'update']
    );


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

    /* Zona de envio */
    Route::get('zonas-envio', [ZonaEnvioController::class, 'index']);
    Route::post('zonas-envio', [ZonaEnvioController::class, 'store']);
    Route::put('zonas-envio/{zona}', [ZonaEnvioController::class, 'update']);
    Route::delete('zonas-envio/{zona}', [ZonaEnvioController::class, 'destroy']);
});

Route::prefix('shop')->group(function () {
    Route::get('/articulos', [ArticuloPublicController::class, 'index']);
    Route::get('/categorias', [CategoriaPublicController::class, 'index']);

    Route::get('/articulos/{articulo}', [ArticuloPublicController::class, 'show']);
    Route::get('/pizza-plantilla', [PizzaPlantillaController::class, 'show']);
    Route::get('/pizzas-existentes', [PizzasExistentesController::class, 'pizzasExistentes']);
});