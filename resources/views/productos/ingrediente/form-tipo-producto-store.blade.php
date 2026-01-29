{{-- Formulario para tipo de producto --}}
<form id="form-tipo-product" action="{{ route('tipos') }}" method="POST" data-redirect="{{ route('productos') }}"
    class="form-dinamico hidden mt-6 p-4 border border-gray-300 rounded">
    @csrf

    <div>
        <label for="nombre_tipo" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Nuevo tipo de producto
        </label>
        <input type="text" id="nombre_tipo" name="nombre" class="form-input"
            placeholder="Ingrese el nombre del tipo de producto" required>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    <div class="mt-4 flex gap-2">
        <!-- Botón Guardar -->
        <button
            class="btn bg-primary text-white px-4 py-2  
        transition-all duration-300 ease-in-out 
        hover:bg-blue-600 hover:shadow-md"
            type="submit">
            Guardar
        </button>

        <!-- Botón Cancelar -->
        <button
            class="btn bg-gray-500 text-white px-4 py-2
        transition-all duration-300 ease-in-out"
        hover:bg-gray-600 
            type="button" data-close="form-tipo-product">
            Cancelar
        </button>
    </div>

</form>
