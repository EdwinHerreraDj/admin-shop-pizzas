<!-- Tabla Artículos -->
<div id="table-wrapper" class="mt-6 tabla">
    <table id="table-articulos" class="display w-full datatable">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Tipo de producto</th>
                <th>Ingredientes</th>
                <th>Imagen</th>
                <th>Precios</th>
                <th>Personalizable</th>
                <th>Publicado</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($articulos as $articulo)
                <tr>
                    <td>{{ $articulo->id }}</td>
                    <td>{{ $articulo->nombre }}</td>
                    <td>{{ $articulo->categoria->nombre ?? 'Sin categoría' }}</td>
                    <td>{{ $articulo->tipoProducto->nombre ?? 'Sin tipo' }}</td>
                    <td>
                        @if ($articulo->ingredientes->isNotEmpty())
                            <ul class="text-sm">
                                @foreach ($articulo->ingredientes as $ing)
                                    <li>{{ $ing->nombre }}</li>
                                @endforeach
                            </ul>
                        @else
                            <span class="text-gray-500 text-sm">Sin ingredientes</span>
                        @endif
                    </td>

                    <td>
                        @if ($articulo->imagen_url)
                            <img src="{{ asset('storage/' . $articulo->imagen_url) }}" alt="{{ $articulo->nombre }}"
                                class="h-12 w-12 object-cover rounded">
                        @else
                            <span class="text-gray-500 text-sm">No hay imagen</span>
                        @endif
                    <td>
                        <div class="text-sm">
                            @if ($articulo->precio_pequena)
                                <p>P: €{{ number_format($articulo->precio_pequena, 2) }}</p>
                            @endif
                            @if ($articulo->precio_mediana)
                                <p>M: €{{ number_format($articulo->precio_mediana, 2) }}</p>
                            @endif
                            @if ($articulo->precio_grande)
                                <p>G: €{{ number_format($articulo->precio_grande, 2) }}</p>
                            @endif
                            @if ($articulo->precio_unico)
                                <p>U: €{{ number_format($articulo->precio_unico, 2) }}</p>
                            @endif
                        </div>
                    </td>
                    <td>
                        @if ($articulo->es_personalizable)
                            <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Sí</span>
                        @else
                            <span class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">No</span>
                        @endif
                    </td>
                    <td>
                        @if ($articulo->publicado)
                            <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Sí</span>
                        @else
                            <span class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">No</span>
                        @endif
                    </td>
                    <td>
                        <div class="actions flex gap-2">
                            <!-- Botón editar -->
                            {{-- Importante, que los data tengan el mismo nombre, que cada uno de los campos inputs del formulario edit --}}
                            <button class="open-modal p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                title="Editar artículo" data-open="form-articulos-edit" data-id="{{ $articulo->id }}"
                                data-nombre="{{ $articulo->nombre }}"
                                data-categoria_id="{{ $articulo->categoria_id }}"
                                data-descripcion="{{ $articulo->descripcion }}"
                                data-precio_pequena="{{ $articulo->precio_pequena }}"
                                data-precio_mediana="{{ $articulo->precio_mediana }}"
                                data-precio_grande="{{ $articulo->precio_grande }}"
                                data-precio_unico="{{ $articulo->precio_unico }}"
                                data-ingredientes='@json($articulo->ingredientes->pluck('id'))'
                                data-tipo_producto_id="{{ $articulo->tipo_producto_id }}"
                                data-es_personalizable="{{ $articulo->es_personalizable ? '1' : '0' }}",
                                data-publicado="{{ $articulo->publicado ? '1' : '0' }}",
                                data-url="{{ route('articulo.editar', $articulo->id) }}">

                                <img src="/images/icons/edit.svg" alt="Editar" class="w-4 h-4">
                            </button>

                            <!-- Botón eliminar -->
                            <button class="delete-btn p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                data-url="{{ route('articulo.eliminar', $articulo->id) }}"
                                data-name="{{ $articulo->nombre }}">
                                <img src="/images/icons/delete.svg" alt="Eliminar" class="w-4 h-4">
                            </button>
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
