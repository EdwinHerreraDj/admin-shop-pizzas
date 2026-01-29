<!DOCTYPE html>
<html lang="es">

<head>
    @include('layouts.shared/title-meta', ['title' => 'Login'])

    @include('layouts.shared/head-css')
</head>

<body>

    <div class="bg-gradient-to-r from-rose-100 to-teal-100 dark:from-gray-700 dark:via-gray-900 dark:to-black">


        <div class="h-screen w-screen flex justify-center items-center">

            <div class="2xl:w-1/4 lg:w-1/3 md:w-1/2 w-full">
                <div class="card overflow-hidden sm:rounded-md rounded-none">
                    <div class="p-6">
                        <a href="{{ route('any', 'index') }}" class="flex justify-center mb-8">
                            <img src="/images/logo.png" alt="Logo" class="h-24 sm:h-28 dark:hidden object-contain">
                        </a>


                        @if ($errors->has('login'))
                            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center mb-4"
                                role="alert">
                                <svg class="w-6 h-6 text-red-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <div>
                                    <p class="font-bold text-sm">Error</p>
                                    <p class="text-sm">{{ $errors->first('login') }}</p>
                                </div>
                            </div>
                        @endif

                        <form method="POST" action="{{ route('login') }}"
                            class="max-w-md w-full mx-auto px-4 sm:px-6 mb-5">
                            @csrf
                            <!-- Email -->
                            <div class="mb-5">
                                <label for="LoggingEmailAddress"
                                    class="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                                    Email
                                </label>
                                <input id="LoggingEmailAddress" name="email" type="email"
                                    value="{{ old('email') }}" placeholder="Ingrese su email"
                                    class="form-input w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none text-sm">
                            </div>

                            <!-- Password -->
                            <div class="mb-5">
                                <label for="loggingPassword"
                                    class="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                                    Contraseña
                                </label>

                                <div class="relative">
                                    <input id="loggingPassword" name="password" type="password"
                                        placeholder="Ingrese su contraseña" value="{{ old('password') }}"
                                        class="form-input w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none text-sm pr-10">

                                    <!-- Icono mostrar/ocultar -->
                                    <button type="button" id="togglePassword"
                                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary dark:text-gray-300 focus:outline-none">
                                        <i id="togglePasswordIcon" class="mgc_eye_line text-lg"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Recordar sesión + Recuperar contraseña -->
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
                                <label class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" id="checkbox-signin"
                                        class="form-checkbox rounded text-primary focus:ring-primary">
                                    <span class="ml-2">Recordar sesión</span>
                                </label>
                                <a href="{{ route('second', ['auth', 'recoverpw']) }}"
                                    class="text-sm text-primary border-b border-dashed border-primary hover:text-primary/80">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <!-- Botón -->
                            <div>
                                <button type="submit"
                                    class="btn w-full text-white bg-primary hover:bg-primary/90 py-2 rounded-lg font-semibold text-sm transition-all">
                                    Acceder
                                </button>
                            </div>
                        </form>


                        <div class="flex gap-4 justify-center mb-6">
                            <a href="javascript:void(0)" class="btn border-light text-gray-400 dark:border-slate-700">
                                <span class="flex justify-center items-center gap-2">
                                    <i class="mgc_github_line text-info text-xl"></i>
                                    <span class="lg:block hidden">Github</span>
                                </span>
                            </a>
                            <a href="javascript:void(0)" class="btn border-light text-gray-400 dark:border-slate-700">
                                <span class="flex justify-center items-center gap-2">
                                    <i class="mgc_google_line text-danger text-xl"></i>
                                    <span class="lg:block hidden">Google</span>
                                </span>
                            </a>
                            <a href="javascript:void(0)" class="btn border-light text-gray-400 dark:border-slate-700">
                                <span class="flex justify-center items-center gap-2">
                                    <i class="mgc_facebook_line text-primary text-xl"></i>
                                    <span class="lg:block hidden">Facebook</span>
                                </span>
                            </a>
                        </div>

                        <p class="text-gray-500 dark:text-gray-400 text-center">Soporte tecnico ®<a
                                href="{{ route('register') }}" class="text-primary ms-1"><b>Alminares S.L</b></a>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <script>
        @vite(['resources/js/pages/login.js'])
    </script>


</body>

</html>
