<div class="flex gap-4 mt-4">
    <!-- Botón Agregar Ingrediente -->
    <button
        class="btn bg-primary text-white flex items-center px-4 py-2 
    transition-all duration-300 ease-in-out 
    hover:bg-blue-600  hover:shadow-blue-400/50"
        data-open="form-ingrediente" type="button">
        <!-- Icono -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Ingrediente
    </button>

    <!-- Botón Agregar Tipo de producto -->
    <button
        class="btn bg-primary text-white flex items-center px-4 py-2 
    transition-all duration-300 ease-in-out 
    hover:bg-blue-600  hover:shadow-blue-400/50"
        data-open="form-tipo-product" type="button">
        <!-- Icono -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Tipo de producto
    </button>
</div>




@include('productos.ingrediente.form-tipo-producto-store')

@include('productos.ingrediente.form-tipo-producto-edit')

@include('productos.ingrediente.form-ingrediente-store')


@include('productos.ingrediente.form-ingrediente-edit')


{{-- Incluir la vista de tipos de productos --}}
@include('productos.ingrediente.tipo-producto')

{{-- Vista de la tabla de ingredientes --}}

@include('productos.ingrediente.tabla-ingredientes')
