{{-- Formulario para edición tipo de producto --}}
<form id="form-edit-tipo-product" method="POST" data-redirect="{{ route('productos') }}"
    class="form-dinamico hidden mt-6 p-4 border border-gray-300 rounded">
    @csrf
    @method('PUT')
    <div>
        <input type="hidden" id="edit_id" name="id">
        <label for="edit_nombre_tipo" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Editar tipo de producto
        </label>
        <input type="text" id="edit_nombre_tipo" name="nombre" class="form-input"
            placeholder="Ingrese el nombre del tipo de producto" required>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>
    <div class="mt-4 flex gap-2">
        <!-- Botón Actualizar -->
        <button
            class="btn bg-primary text-white px-4 py-2 
        transition-all duration-300 ease-in-out 
        hover:bg-blue-600 "
            type="submit">
            Actualizar
        </button>

        <!-- Botón Cancelar -->
        <button
            class="btn bg-gray-500 text-white px-4 py-2 
        transition-all duration-300 ease-in-out 
        hover:bg-gray-600 "
            type="button" data-close="form-edit-tipo-product">
            Cancelar
        </button>
    </div>

</form>
