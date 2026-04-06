<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RoutingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LoginLogController;
use App\Http\Controllers\Admin\TipoProductoController;
use App\Http\Controllers\Admin\TamanoController;
use App\Http\Controllers\Admin\CategoriaIngredienteController;
use App\Http\Controllers\Admin\IngredienteController;
use App\Http\Controllers\Admin\IngredientePrecioController;
use App\Http\Controllers\Admin\ArticuloController;
use App\Http\Controllers\Admin\ArticuloPrecioController;
use App\Http\Controllers\Admin\ZonaEnvioController;
use App\Http\Controllers\Admin\CategoriaArticuloController;
use App\Http\Controllers\Admin\CocinaController;

/* MODELOS */
use App\Models\Articulo;


/* NUEVO */
use App\Http\Controllers\Admin\IngredienteApiController;

require __DIR__ . '/auth.php';

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | HOME / CORE
    |--------------------------------------------------------------------------
    */

    Route::get('/', [RoutingController::class, 'home'])->name('root');
    Route::get('/home', [RoutingController::class, 'home'])->name('home');
    Route::post('/logout', [RoutingController::class, 'logout'])->name('logout_action');


    /*
    |--------------------------------------------------------------------------
    | USERS
    |--------------------------------------------------------------------------
    */

    Route::resource('users', UserController::class);
    Route::get('/login-logs', [LoginLogController::class, 'index'])->name('login.logs');

    /*
    |--------------------------------------------------------------------------
    | ADMIN - TIPOS DE PRODUCTO
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/tipos-producto', function () {
        return view('admin.tipos-producto.index');
    })->name('admin.tipos-producto.index');

    /*
    |--------------------------------------------------------------------------
    | ADMIN - TAMAÑOS
    |--------------------------------------------------------------------------
    */


    Route::get('/admin/tamanos', function () {
        return view('admin.tamanos.index');
    })->name('admin.tamanos.index');


    /*
    |--------------------------------------------------------------------------
    | ADMIN - CATEGORÍAS DE INGREDIENTES
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/categorias-ingredientes', function () {
        return view('admin.categorias-ingredientes.index');
    })->name('admin.categorias-ingredientes.index');

    /*
    |--------------------------------------------------------------------------
    | ADMIN - CATEGORÍAS DE INGREDIENTES
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/ingredientes', function () {
        return view('admin.ingredientes.index');
    })->name('admin.ingredientes.index');

    /*
    |--------------------------------------------------------------------------
    | ADMIN - PRECIOS DE INGREDIENTES
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/precios-ingredientes', function () {
        return view('admin.precios-ingredientes.index');
    })->name('admin.precios-ingredientes.index');

    /*
    |--------------------------------------------------------------------------
    | ADMIN - ARTÍCULOS
    |--------------------------------------------------------------------------
    */


    Route::get('/admin/articulos', function () {
        return view('admin.articulos.index');
    })->name('admin.articulos.index');

    /*
|--------------------------------------------------------------------------
| ADMIN - ZONAS DE ENVÍO
|--------------------------------------------------------------------------
*/

    Route::get('/admin/zonas-envio', function () {
        return view('admin.zonas-envio.index');
    })->name('admin.zonas-envio.index');

    Route::get('/admin/franjas-horarias', function () {
        return view('admin.franjas-horarias.index');
    })->name('admin.franjas-horarias.index');

    Route::get('/admin/metodos-pago', function () {
        return view('admin.metodos-pago.index');
    })->name('admin.metodos-pago.index');

    /*
|--------------------------------------------------------------------------
| ADMIN - CATEGORÍAS DE ARTÍCULOS
|--------------------------------------------------------------------------
*/

    Route::get('/admin/categorias-articulos', function () {
        return view('admin.categorias-articulos.index');
    })->name('admin.categorias-articulos.index');

    /* Orden se los articulos dentro de las categorias */
    Route::get('/admin/categorias-articulos/orden', function () {
        return view('admin.categorias-articulos.orden');
    })->name('admin.categorias-articulos.orden');




    /*
    |--------------------------------------------------------------------------
    | ADMIN - PRECIOS DE ARTÍCULOS
    |--------------------------------------------------------------------------
    */


    Route::get('/admin/precios-articulos', function () {
        return view('admin.precios-articulos.index');
    })->name('admin.precios-articulos.index');


    Route::get(
        '/admin/articulos/{articulo}/ingredientes',
        function (Articulo $articulo) {
            return view('admin.articulos.ingredientes', compact('articulo'));
        }
    )->name('admin.articulos.ingredientes');

    /*
    |--------------------------------------------------------------------------
    | ADMIN - COCINA
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/cocina', function () {
        return view('admin.cocina.index');
    })->name('admin.cocina.index');
    
    /*
    |--------------------------------------------------------------------------
    | ADMIN - INFORMES DE PEDIDOS
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/gestion-pedidos', function () {
        return view('admin.gestion-pedidos.index');
    })->name('admin.gestion-pedidos.index');

    /*
    |--------------------------------------------------------------------------
    | RUTAS DINÁMICAS — SIEMPRE AL FINAL
    |--------------------------------------------------------------------------
    */

    Route::get('{first}/{second}/{third}', [RoutingController::class, 'thirdLevel'])->name('third');
    Route::get('{first}/{second}', [RoutingController::class, 'secondLevel'])->name('second');
    Route::get('{any}', [RoutingController::class, 'root'])->name('any');
});
