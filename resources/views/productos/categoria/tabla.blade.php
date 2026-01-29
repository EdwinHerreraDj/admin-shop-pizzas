<!-- Tabla Categorias -->
<div id="table-wrapper" class="mt-6">
    <table class="display w-full datatable">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($categorias as $categoria)
                <tr>
                    <td>{{ $categoria->id }}</td>
                    <td>{{ $categoria->nombre }}</td>
                    <td>
                        <div class="actions">
                            <button class="open-modal p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                title="Editar Usuario" 
                                data-open="form-categoria-edit"   
                                data-nombre="{{ $categoria->nombre }}"
                                data-url="{{ route('categoria.editar', $categoria->id) }}">
                                <img src="/images/icons/edit.svg" alt="Editar" class="w-4 h-4">
                            </button>

                            <button class="delete-btn p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                data-url="{{ route('categoria.eliminar', $categoria->id) }}" data-name="Categoría {{ $categoria->nombre }}">
                                <img src="/images/icons/delete.svg" alt="Eliminar" class="w-4 h-4">
                            </button>
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>



