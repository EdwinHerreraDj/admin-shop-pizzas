@extends('layouts.vertical', ['title' => 'Users', 'sub_title' => 'Paginas', 'mode' => $mode ?? '', 'demo' => $demo ?? ''])

@section('css')
    @vite(['node_modules/sweetalert2/dist/sweetalert2.min.css'])
    <meta name="csrf-token" content="{{ csrf_token() }}">
@endsection

@section('content')
    {{-- Boton para crear un suario --}}
    <button onclick="openModal('addUserModal')"
        class="flex items-center mb-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
        <!-- Icono -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Usuario
    </button>

    {{-- Mensaje de éxito --}}
    @if (session('success'))
        <script>
            const notyf = new Notyf({
                duration: 4000,
                dismissible: true,
                position: {
                    x: 'right',
                    y: 'top',
                },
            });

            // Mostrar mensaje de éxito
            notyf.success('{{ session('success') }}');
        </script>
    @endif




    {{-- Tabla de usuarios --}}
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
            <div class="card p-6">
                <h2 class="text-xl font-semibold mb-4">Usuarios</h2>
                <div class="overflow-x-auto relative">

                    <!-- Tabla real -->
                    <div id="table-wrapper">
                        <table id="table-data" class="display w-full">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Fecha de creación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($users as $user)
                                    <tr>
                                        <td>{{ $user->id }}</td>
                                        <td>{{ $user->name }}</td>
                                        <td>{{ $user->email }}</td>
                                        <td>{{ $user->role ?? 'N/A' }}</td>
                                        <td>{{ $user->created_at }}</td>
                                        <td>
                                            <div class="actions">
                                                <button
                                                    class="open-modal p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                    onclick="editUser({{ $user->id }}, '{{ $user->name }}', '{{ $user->email }}', '{{ $user->role }}')"
                                                    title="Editar Usuario">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        class="feather feather-edit">
                                                        <path
                                                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7">
                                                        </path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z">
                                                        </path>
                                                    </svg>
                                                </button>

                                                <button
                                                    class="delete-user p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    data-user-id="{{ $user->id }}">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        class="feather feather-delete">
                                                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                                                        <line x1="18" y1="9" x2="12" y2="15">
                                                        </line>
                                                        <line x1="12" y1="9" x2="18" y2="15">
                                                        </line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </div>



    {{-- Modal para crear usuario --}}
    <div id="addUserModal"
        class="fixed inset-0 z-50 {{ $errors->any() ? 'flex' : 'hidden' }} items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div class="flex justify-between items-center p-4 border-b">
                <h3 class="text-lg font-medium text-gray-800">Agregar Usuario</h3>
                <button class="text-gray-400 hover:text-gray-600" onclick="closeModal('addUserModal')">&times;</button>
            </div>
            <div class="p-6">
                <form id="addUserForm" method="POST" action="{{ route('users.store') }}" no>
                    @csrf
                    <!-- Nombre -->
                    <div class="mb-4">
                        <label for="user_name" class="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" id="user_name" name="name" value="{{ old('name') }}" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 @error('name') border-red-500 @enderror"
                            placeholder="Nombre y apellido">
                        @error('name')
                            <span class="text-sm text-red-500">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Correo Electrónico -->
                    <div class="mb-4">
                        <label for="user_email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input type="email" id="user_email" name="email" value="{{ old('email') }}" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 @error('email') border-red-500 @enderror"
                            placeholder="example@gamil.com">
                        @error('email')
                            <span class="text-sm text-red-500">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Contraseña -->
                    <div class="mb-4">
                        <label for="user_password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input type="password" id="user_password" name="password" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 @error('password') border-red-500 @enderror"
                            placeholder="Contraseña">
                        @error('password')
                            <span class="text-sm text-red-500">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Confirmar Contraseña -->
                    <div class="mb-4">
                        <label for="user_password_confirmation" class="block text-sm font-medium text-gray-700">Confirmar
                            Contraseña</label>
                        <input type="password" id="user_password_confirmation" name="password_confirmation" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 @error('password_confirmation') border-red-500 @enderror"
                            placeholder="Repetir contraseña">
                        @error('password_confirmation')
                            <span class="text-sm text-red-500">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Rol -->
                    <div class="mb-4">
                        <label for="user_role" class="block text-sm font-medium text-gray-700">Rol</label>
                        <select id="user_role" name="role" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 @error('role') border-red-500 @enderror">
                            <option value="super_admin" {{ old('role') == 'super_admin' ? 'selected' : '' }}>Super Admin
                            </option>
                            <option value="admin" {{ old('role') == 'admin' ? 'selected' : '' }}>Admin</option>
                            <option value="user" {{ old('role') == 'user' ? 'selected' : '' }}>User</option>
                            <option value="guest" {{ old('role') == 'guest' ? 'selected' : '' }}>Guest</option>
                        </select>
                        @error('role')
                            <span class="text-sm text-red-500">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Botones -->
                    <div class="flex justify-end space-x-2">
                        <button type="button" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            onclick="closeModal('addUserModal')">Cancelar</button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>




    {{-- Modal para editar un usuario --}}
    <div id="editUserModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div class="flex justify-between items-center p-4 border-b">
                <h3 class="text-lg font-medium text-gray-800">Editar Usuario</h3>
                <button class="text-gray-400 hover:text-gray-600" onclick="closeModal('editUserModal')">&times;</button>
            </div>
            <div class="p-6">
                <form id="editUserForm" method="POST">
                    @csrf
                    @method('PUT')
                    <!-- Nombre -->
                    <div class="mb-4">
                        <label for="edit_user_name" class="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" id="edit_user_name" name="name" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <!-- Correo Electrónico -->
                    <div class="mb-4">
                        <label for="edit_user_email" class="block text-sm font-medium text-gray-700">Correo
                            Electrónico</label>
                        <input type="email" id="edit_user_email" name="email" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <!-- Contraseña -->
                    <div class="mb-4">
                        <label for="edit_user_password" class="block text-sm font-medium text-gray-700">Nueva
                            Contraseña</label>
                        <input type="password" id="edit_user_password" name="password"
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nueva contraseña">
                    </div>
                    <!-- Confirmar Contraseña -->
                    <div class="mb-4">
                        <label for="edit_user_password_confirmation"
                            class="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <input type="password" id="edit_user_password_confirmation" name="password_confirmation"
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Repetir contraeña">
                        <span id="passError" class="text-red-600 hidden">Las contraseñas no coinciden</span>
                    </div>
                    <!-- Rol -->
                    <div class="mb-4">
                        <label for="edit_user_role" class="block text-sm font-medium text-gray-700">Rol</label>
                        <select id="edit_user_role" name="role" required
                            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="guest">Guest</option>
                        </select>
                    </div>
                    <!-- Botones -->
                    <div class="flex justify-end space-x-2">
                        <button type="button" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            onclick="closeModal('editUserModal')">Cancelar</button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection


@section('script')
    @vite(['resources/js/pages/extended-sweetalert.js'])
    @vite(['resources/js/pages/highlight.js'])
    @vite(['resources/js/table-users.js'])
@endsection
