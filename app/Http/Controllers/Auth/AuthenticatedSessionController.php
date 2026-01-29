<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function create()
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        // Intentar autenticar al usuario
        if (! Auth::attempt($credentials, $request->filled('remember'))) {
            // Si las credenciales son incorrectas, redirigir con un mensaje de error genérico
            return redirect()->back()->withErrors([
                'login' => 'Las credenciales proporcionadas no son válidas.',
            ])->withInput($request->only('email', 'remember'));
        }

        // Regenerar la sesión para proteger contra fijación de sesión
        $request->session()->regenerate();

        // Guardar el rol, nombre y correo electrónico del usuario autenticado en la sesión
        $user = Auth::user();
        session([
            'user_role' => $user->role,
            'user_name' => $user->name,
            'user_email' => $user->email,
        ]);

        if (Auth::check()) {

            if (Auth::user()->role === 'admin' || Auth::user()->role === 'super_admin') {
                return redirect()->route('home');
            } else {
                return redirect()->route('unidad');
            }

        }

        return redirect()->route('login');
    }
}
