<?php

return [

    /*
    |--------------------------------------------------------------------------
    | INFORMACIÓN GENERAL DEL PANEL
    |--------------------------------------------------------------------------
    */

    'meta' => [
        'nombre' => 'Panel Administración Pizzería',
        'stack' => [
            'backend' => 'Laravel',
            'frontend' => 'React embebido en Blade',
            'api_prefix' => '/api/admin',
            'auth' => 'Session + CSRF',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | ARQUITECTURA DE BASE DE DATOS (RESUMEN ESTRUCTURAL)
    |--------------------------------------------------------------------------
    */

    'database' => [

        'core_entities' => [
            'tipos_producto',
            'articulos',
            'tamanos',
            'articulo_precios',
            'categorias_articulos',
            'articulo_categoria',
            'categorias_ingredientes',
            'ingredientes',
            'ingrediente_precios',
            'articulo_ingredientes',
        ],

        'descripcion' => [
            'articulos' => 'Producto principal (pizza, bebida, complemento)',
            'tamanos' => 'Tamaños disponibles',
            'articulo_precios' => 'Precio base por tamaño',
            'ingredientes' => 'Ingredientes generales del sistema',
            'ingrediente_precios' => 'Precio por tipo_producto + tamaño',
            'articulo_ingredientes' => 'Configuración por artículo (base/extra, obligatorio, max_cantidad)',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | MÓDULOS DEL PANEL
    |--------------------------------------------------------------------------
    */

    'modules' => [

        'tipos_producto' => [
            'route' => '/admin/tipos-producto',
            'react_component' => 'TiposProductoIndex',
            'api_resource' => '/tipos-producto',
        ],

        'tamanos' => [
            'route' => '/admin/tamanos',
            'react_component' => 'TamanosIndex',
            'api_resource' => '/tamanos',
        ],

        'categorias_ingredientes' => [
            'route' => '/admin/categorias-ingredientes',
            'react_component' => 'CategoriasIngredientesIndex',
            'api_resource' => '/categorias-ingredientes',
        ],

        'ingredientes' => [
            'route' => '/admin/ingredientes',
            'react_component' => 'IngredientesIndex',
            'api_resource' => '/ingredientes',
        ],

        'articulos' => [
            'route' => '/admin/articulos',
            'react_component' => 'ArticulosIndex',
            'submodules' => [
                'precios' => 'PreciosArticulosIndex',
                'ingredientes_config' => 'ArticuloIngredientes',
                'categorias' => 'CategoriasArticulosIndex',
                'orden_categorias' => 'OrdenCategorias',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | LÓGICA DE PERSONALIZACIÓN DE PIZZAS
    |--------------------------------------------------------------------------
    */

    'pizza_logic' => [

        'tipos_soportados' => [
            'pizza_entera',
            'pizza_mitad',
            'producto_unico',
        ],

        'reglas' => [
            'precio_base_viene_de' => 'articulo_precios',
            'extras_precio_viene_de' => 'ingrediente_precios',
            'ingredientes_base_definidos_en' => 'articulo_ingredientes',
            'ingredientes_extra_definidos_en' => 'articulo_ingredientes',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | PRINCIPIOS ARQUITECTÓNICOS
    |--------------------------------------------------------------------------
    */

    'principios' => [

        'separacion_responsabilidades' => true,
        'sin_logica_implicita' => true,
        'precios_normalizados' => true,
        'react_controla_ui' => true,
        'laravel_controla_negocio' => true,

    ],

];
