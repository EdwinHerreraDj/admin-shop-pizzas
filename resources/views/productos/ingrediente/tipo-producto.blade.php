<h1 class="mt-8 mb-6 text-lg md:text-xl font-extrabold text-primary-700 dark:text-primary-300 tracking-tight drop-shadow-lg">
    <span class="inline-block bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 bg-clip-text text-transparent">
        Tipos de productos
    </span>
    <span class="block text-sm md:text-base font-medium text-gray-500 dark:text-gray-300 mt-2">
        (Clasifican los ingredientes de cada producto)
    </span>
</h1>
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
    @foreach ($tipoProducto as $tipo)
        <div
            class="relative group p-6 bg-white dark:bg-gray-800 border border-gray-200 
                    dark:border-gray-700 rounded-xl shadow-md text-center 
                    hover:shadow-lg transition">

            <!-- Nombre del tipo -->
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
                {{ $tipo->nombre }}
            </h3>

            <!-- Botones ocultos que aparecen al pasar el mouse -->
            <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <!-- Editar -->
                <button class="open-modal p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    title="Editar tipo de producto" data-open="form-edit-tipo-product" data-id="{{ $tipo->id }}"
                    data-nombre="{{ $tipo->nombre }}" data-url="{{ route('tipo.editar', $tipo->id) }}">
                    <img src="/images/icons/edit.svg" alt="Editar" class="w-4 h-4">
                </button>

                <!-- Eliminar -->
                <button class="delete-btn p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Eliminar tipo de producto" data-url="{{route('tipo.eliminar', $tipo->id)}}" data-name="{{ $tipo->nombre }}" data-redirect="true">
                    <img src="/images/icons/delete.svg" alt="Eliminar" class="w-4 h-4">
                </button>
            </div>
        </div>
    @endforeach
</div>
