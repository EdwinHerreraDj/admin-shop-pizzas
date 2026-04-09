<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectCocina
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->role === 'cocina') {
            // Permitir solo la ruta de cocina y logout
            $rutasPermitidas = [
                'admin/cocina',
                'logout',
            ];

            $ruta = $request->path();
            $permitida = false;

            foreach ($rutasPermitidas as $permitidaRuta) {
                if (str_starts_with($ruta, $permitidaRuta)) {
                    $permitida = true;
                    break;
                }
            }

            if (! $permitida) {
                return redirect()->route('admin.cocina.index');
            }
        }

        return $next($request);
    }
}
