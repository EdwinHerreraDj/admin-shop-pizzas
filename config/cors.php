<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5174',
        'http://localhost:5173',
        'https://shoppizzas.alminares.es',
        'https://adminpizzasnueva.alminares.es',
        // Tienda pública en el VPS. Debe estar aquí (no solo en el servidor):
        // deploy-admin.sh sincroniza config/ desde main y sobrescribe los cambios manuales.
        'https://pizzeriacasadecampo.es',
        'https://www.pizzeriacasadecampo.es',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
