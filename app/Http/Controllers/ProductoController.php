<?php

namespace App\Http\Controllers;

use App\Models\Articulo;
use App\Models\Categoria;
use App\Models\Ingrediente;
use App\Models\TipoProducto;

class ProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categorias = Categoria::all();
        $articulos = Articulo::with('ingredientes')->get();
        $tipoProducto = TipoProducto::all();
        $ingredientes = Ingrediente::with('tiposProductos')->get();

        return view('productos.index', compact(
            'categorias',
            'articulos',
            'tipoProducto',
            'ingredientes'
        ));
    }
}
