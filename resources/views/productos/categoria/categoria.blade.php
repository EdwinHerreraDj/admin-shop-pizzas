{{-- BOTON DE HABILITRA EL FORMULARIO --}}
<button
    class="btn bg-primary text-white flex items-center px-4 py-2 
    transition-all duration-300 ease-in-out 
    hover:bg-blue-600  hover:shadow-blue-400/50"
    type="button" data-open="form-categoria">
    <!-- Icono -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    Agregar Categoría
</button>



{{-- FORMULARIO DE CREACION --}}
<form id="form-categoria" action="{{ route('categorias') }}" method="POST" data-redirect="{{ route('productos') }}"
    class="form-dinamico hidden mt-6 p-4 border border-gray-300 rounded">
    @csrf

    <div>
        <label for="simpleinput" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Nueva categoría
        </label>
        <input type="text" id="simpleinput" name="nombre" class="form-input"
            placeholder="Ingrese el nombre de la categoría" required>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    <div class="mt-4 flex gap-2">
        <button class="btn bg-primary text-white" type="submit">Guardar</button>
        <button class="btn bg-gray-500 text-white" type="button" data-close="form-categoria">
            Cancelar
        </button>
    </div>
</form>


{{-- Formulario de edición --}}
<form id="form-categoria-edit" method="POST" class="form-dinamico hidden mt-6 p-4 border border-gray-300 rounded">
    @csrf
    @method('PUT')

    <div>
        <label for="edit-nombre" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Editar categoría
        </label>
        <input type="text" id="edit-nombre" name="nombre" class="form-input"
            placeholder="Ingrese el nombre de la categoría" required>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    <div class="mt-4 flex gap-2">
        <button class="btn bg-primary text-white" type="submit">Guardar cambios</button>
        <button class="btn bg-gray-500 text-white" type="button" data-close="form-categoria-edit">
            Cancelar
        </button>
    </div>
</form>


{{-- TABLA DE CATEGORIAS --}}

@include('productos.categoria.tabla')
