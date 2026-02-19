<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\CategoriaArticulo;

class CategoriaPublicController extends Controller
{
    public function index()
    {
        return CategoriaArticulo::query()
            ->where('activo', true)
            ->whereHas('articulos', function ($q) {
                $q->where('publicado', true);
            })
            ->orderBy('orden')
            ->get(['id', 'nombre']);
    }
}
