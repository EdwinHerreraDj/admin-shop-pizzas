<button
    class="btn bg-primary text-white flex items-center px-4 py-2 
    transition-all duration-300 ease-in-out 
    hover:bg-blue-600  hover:shadow-blue-400/50"
    data-open="form-articulos" type="button">
    <!-- Icono -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    Agregar Producto
</button>

@include('productos.articulos.form-store')


@include('productos.articulos.form-edit')


{{-- Tabla de artículos --}}


@include('productos.articulos.tabla')
