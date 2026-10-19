<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Permite el paso solo si el usuario autenticado tiene uno de los roles indicados.
     *
     * Uso: ->middleware('role:admin,super_admin')
     * Debe ir siempre después de un middleware de autenticación.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'No autorizado.'], 403);
            }

            abort(403);
        }

        return $next($request);
    }
}
