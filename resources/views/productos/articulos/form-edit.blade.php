{{-- FORMULARIO DE EDICIÓN --}}
<form id="form-articulos-edit" method="POST" data-redirect="{{ route('productos') }}" enctype="multipart/form-data"
    class="form-dinamico hidden mt-6 p-4 border border-gray-300 rounded">
    @method('PUT')
    @csrf

    {{-- Nombre --}}
    <div>
        <label for="nombre" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Nombre del artículo
        </label>
        <input type="text" id="nombre_edit" name="nombre" class="form-input"
            placeholder="Ingrese el nombre del artículo" required>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    {{-- Descripción --}}
    <div class="mt-4">
        <label for="descripcion" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Descripción
        </label>
        <textarea id="descripcion_edit" name="descripcion" class="form-input" rows="3"
            placeholder="Ingrese una breve descripción del artículo"></textarea>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    {{-- Categoría --}}
    <div class="mt-4">
        <label for="categoria_id" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Categoría
        </label>
        <select id="categoria_id" name="categoria_id" class="form-input" required>
            <option value="">Seleccione una categoría</option>
            @foreach ($categorias as $categoria)
                <option value="{{ $categoria->id }}">{{ $categoria->nombre }}</option>
            @endforeach
        </select>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>


    {{-- Tipo de Producto --}}
    <p class="text-gray-800 text-sm font-medium mb-2">Tipo de Producto</p>
    <p class="p-2 border rounded bg-gray-100 text-gray-700">
        (El tipo de producto no se puede cambiar)
    </p>





    {{-- Ingredientes base --}}
    <div class="mt-4">
        <label class="text-gray-800 text-sm font-medium inline-block mb-2">
            Ingredientes base
        </label>
        <div id="ingredientes-container" class="grid grid-cols-2 gap-4"></div>
    </div>

    {{-- Imagen --}}
    <div class="mt-4">
        <label for="imagen_url" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Imagen del artículo
        </label>
        <p class="mb-4">(Dejar en blanco para no cambiar)</p>
        <input type="file" id="imagen_url" name="imagen_url" class="form-input" accept="image/*">
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    {{-- Precios --}}
    <div class="mt-4 grid grid-cols-2 gap-4">
        <div>
            <label for="precio_pequena" class="text-gray-800 text-sm font-medium inline-block mb-2">Precio
                Pequeña</label>
            <input type="number" step="0.01" id="precio_pequena" name="precio_pequena" class="form-input">
        </div>
        <div>
            <label for="precio_mediana" class="text-gray-800 text-sm font-medium inline-block mb-2">Precio
                Mediana</label>
            <input type="number" step="0.01" id="precio_mediana" name="precio_mediana" class="form-input">
        </div>
        <div>
            <label for="precio_grande" class="text-gray-800 text-sm font-medium inline-block mb-2">Precio
                Grande</label>
            <input type="number" step="0.01" id="precio_grande" name="precio_grande" class="form-input">
        </div>
        <div>
            <label for="precio_unico" class="text-gray-800 text-sm font-medium inline-block mb-2">Precio Único</label>
            <input type="number" step="0.01" id="precio_unico" name="precio_unico" class="form-input">
        </div>
    </div>


    {{-- Publicado --}}
    <div class="mt-4 flex items-center gap-2">
        <input type="checkbox" id="publicado_edit" name="publicado" value="1">
        <label for="publicado" class="text-gray-800 text-sm font-medium">
            ¿Publicado?
        </label>
    </div>

    {{-- Personalizable --}}
    <div class="mt-4 flex items-center gap-2">
        <input type="checkbox" id="es_personalizable_edit" name="es_personalizable" value="1" checked>
        <label for="es_personalizable" class="text-gray-800 text-sm font-medium">
            ¿Se puede personalizar con ingredientes?
        </label>
    </div>

    {{-- Botones --}}
    <div class="mt-6 flex gap-2">
        <button class="btn bg-primary text-white" type="submit">Actualizar</button>
        <button class="btn bg-gray-500 text-white" type="button" data-close="form-articulos-edit">
            Cancelar
        </button>
    </div>
</form>
