<?php

use App\Http\Controllers\ArticulosController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\IngredienteController;
use App\Http\Controllers\LoginLogController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\RoutingController;
use App\Http\Controllers\TipoProductoController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

Route::group(['prefix' => '/', 'middleware' => 'auth'], function () {
    Route::get('', [RoutingController::class, 'home'])->name('root');

    /* Rutas explicitas */
    Route::get('/home', [RoutingController::class, 'home'])->name('home');
    Route::get('/logout', [RoutingController::class, 'logout'])->name('logout_action');
    /* Control de CRUDS para los users */
    Route::resource('users', UserController::class);
    Route::get('/login-logs', [LoginLogController::class, 'index'])->name('login.logs');

    /* Urls products */
    Route::get('/productos', [ProductoController::class, 'index'])->name('productos');

    /* Urls categorias */
    Route::post('/productos/categoria/crear', [CategoriaController::class, 'store'])->name('categorias');
    Route::put('/productos/categoria/editar/{id}', [CategoriaController::class, 'edit'])->name('categoria.editar');
    Route::delete('/productos/categoria/{id}', [CategoriaController::class, 'destroy'])->name('categoria.eliminar');

    /* Urls articulos */
    Route::post('/productos/articulo/crear', [ArticulosController::class, 'store'])->name('articulos');
    Route::put('/productos/articulo/editar/{id}', [ArticulosController::class, 'edit'])->name('articulo.editar');
    Route::delete('/productos/articulo/{id}', [ArticulosController::class, 'destroy'])->name('articulo.eliminar');

    /* Urls Tipo producto */
    Route::post('/productos/tipo/crear', [TipoProductoController::class, 'store'])->name('tipos');
    Route::delete('/productos/tipo/{id}', [TipoProductoController::class, 'destroy'])->name('tipo.eliminar');
    Route::put('/productos/tipo/editar/{id}', [TipoProductoController::class, 'edit'])->name('tipo.editar');

    /* Urls Ingredientes */
    Route::post('/productos/ingrediente/crear', [IngredienteController::class, 'store'])->name('ingredientes');
    Route::put('/productos/ingrediente/editar/{id}', [IngredienteController::class, 'edit'])->name('ingrediente.editar');
    Route::delete('/productos/ingrediente/{id}', [IngredienteController::class, 'destroy'])->name('ingrediente.eliminar');
    Route::get('/ingredientes/tipo/{id}', [IngredienteController::class, 'getByTipo'])->name('ingredientes.porTipo');

    /* Rutas dinamicas - Deben ir al final */
    Route::get('{first}/{second}/{third}', [RoutingController::class, 'thirdLevel'])->name('third');
    Route::get('{first}/{second}', [RoutingController::class, 'secondLevel'])->name('second');
    Route::get('{any}', [RoutingController::class, 'root'])->name('any');
});
