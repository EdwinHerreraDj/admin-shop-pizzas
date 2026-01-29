<div id="table-wrapper" class="mt-6 tabla">
    <table id="table-ingredientes" class="display w-full datatable">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precios por tipo de producto adicional</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($ingredientes as $ingrediente)
                <tr>
                    <td>{{ $ingrediente->id }}</td>
                    <td>{{ $ingrediente->nombre }}</td>
                    <td>{{ $ingrediente->categoria }}</td>
                    <td>
                        <div class="text-sm">
                            @foreach ($ingrediente->tiposProductos as $tipo)
                                <table class="table-auto text-xs border border-gray-300 mb-2 w-full">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th colspan="2" class="text-left px-2 py-1 font-semibold">
                                                {{ $tipo->nombre }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @if ($tipo->pivot->precio_extra_pequena)
                                            <tr>
                                                <td class="px-2 py-1">Pequeña</td>
                                                <td class="px-2 py-1">
                                                    {{ number_format($tipo->pivot->precio_extra_pequena, 2) }}€</td>
                                            </tr>
                                        @endif
                                        @if ($tipo->pivot->precio_extra_mediana)
                                            <tr>
                                                <td class="px-2 py-1">Mediana</td>
                                                <td class="px-2 py-1">
                                                    {{ number_format($tipo->pivot->precio_extra_mediana, 2) }}€</td>
                                            </tr>
                                        @endif
                                        @if ($tipo->pivot->precio_extra_grande)
                                            <tr>
                                                <td class="px-2 py-1">Grande</td>
                                                <td class="px-2 py-1">
                                                    {{ number_format($tipo->pivot->precio_extra_grande, 2) }}€</td>
                                            </tr>
                                        @endif
                                        @if ($tipo->pivot->precio_extra_unico)
                                            <tr>
                                                <td class="px-2 py-1">Único</td>
                                                <td class="px-2 py-1">
                                                    {{ number_format($tipo->pivot->precio_extra_unico, 2) }}€</td>
                                            </tr>
                                        @endif
                                    </tbody>
                                </table>
                            @endforeach

                        </div>
                    </td>
                    <td>
                        <div class="actions flex gap-2">
                            <!-- Botón editar -->

                            <button class="open-modal p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                title="Editar ingrediente" data-open="form-ingrediente-edit"
                                data-id="{{ $ingrediente->id }}" data-nombre="{{ $ingrediente->nombre }}"
                                data-categoria="{{ $ingrediente->categoria }}"
                                data-precios='@json($ingrediente->precios)'
                                data-url="{{ route('ingrediente.editar', $ingrediente->id) }}"
                                onclick="document.getElementById('ancla-section').scrollIntoView({ behavior: 'smooth' });">
                                <img src="/images/icons/edit.svg" alt="Editar" class="w-4 h-4">
                            </button>


                            <!-- Botón eliminar -->
                            <button class="delete-btn p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                data-url="{{ route('ingrediente.eliminar', $ingrediente->id) }}"
                                data-name="{{ $ingrediente->nombre }}">
                                <img src="/images/icons/delete.svg" alt="Eliminar" class="w-4 h-4">
                            </button>
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
