{{-- Formulario de creación de ingrediente --}}
<form id="form-ingrediente" action="{{ route('ingredientes') }}" method="POST" data-redirect="{{ route('productos') }}"
    class="form-dinamico hidden mt-6 p-4 border border-gray-300 rounded">
    @csrf

    {{-- Nombre --}}
    <div>
        <label for="nombre_ingrediente" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Nombre del ingrediente
        </label>
        <input type="text" id="nombre_ingrediente" name="nombre" class="form-input"
            placeholder="Ej: Mozzarella, Peperoni, Lomo" required>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    {{-- Categoría --}}
    <div class="mt-4">
        <label for="categoria_ingrediente" class="text-gray-800 text-sm font-medium inline-block mb-2">
            Categoría
        </label>
        <select id="categoria_ingrediente" name="categoria" class="form-input" required>
            <option value="">Seleccione categoría</option>
            <option value="vegetal">Vegetal</option>
            <option value="carne">Carne</option>
            <option value="proteina_extra">Proteina extra</option>
            <option value="pescado">Pescado</option>
            <option value="queso">Queso</option>
            <option value="salsa">Salsa</option>
            <option value="otros">Otros</option>
        </select>
        <p class="error-message text-red-600 text-sm mt-1"></p>
    </div>

    {{-- Relación con tipos de producto --}}
    <div class="mt-4">
        <label class="text-gray-800 text-sm font-medium inline-block mb-2">
            Tipos de producto en los que aplica
        </label>
        <div class="grid grid-cols-2 gap-3">
            @foreach ($tipoProducto as $tipo)
                <div class="border rounded p-3">
                    <label class="font-medium">{{ $tipo->nombre }}</label>

                    {{-- Si es Pizza -> precios por tamaño --}}
                    @if (strtolower($tipo->nombre) === 'pizzas')
                        <div class="mt-2">
                            <input type="number" value="0.70" step="0.01"
                                name="precios[{{ $tipo->id }}][pequena]" class="form-input"
                                placeholder="Extra pequeña €">
                        </div>
                        <div class="mt-2">
                            <input type="number" value="1" step="0.01"
                                name="precios[{{ $tipo->id }}][mediana]" class="form-input"
                                placeholder="Extra mediana €">
                        </div>
                        <div class="mt-2">
                            <input type="number" value="1.50" step="0.01"
                                name="precios[{{ $tipo->id }}][grande]" class="form-input"
                                placeholder="Extra grande €">
                        </div>
                    @else
                        {{-- Para otros productos -> precio único --}}
                        <div class="mt-2">
                            <input type="number" step="0.01" name="precios[{{ $tipo->id }}][unico]"
                                class="form-input" placeholder="Precio extra único €">
                        </div>
                    @endif
                </div>
            @endforeach
        </div>
    </div>

    {{-- Botones --}}
    <div class="mt-6 flex gap-2">
        <!-- Guardar -->
        <button
            class="btn bg-primary text-white px-4 py-2
        transition-all duration-300 ease-in-out 
        hover:bg-blue-600"
            type="submit">
            Guardar ingrediente
        </button>

        <!-- Cancelar -->
        <button
            class="btn bg-gray-500 text-white px-4 py-2 
        transition-all duration-300 ease-in-out 
        hover:bg-gray-600 "
            type="button" data-close="form-ingrediente">
            Cancelar
        </button>
    </div>

</form>
