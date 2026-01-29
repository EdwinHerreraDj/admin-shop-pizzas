document.addEventListener("DOMContentLoaded", function () {
    const table = document.querySelector("#table-data");
    if (table) {
        initializeDataTable(table);
    }

    const tables = document.querySelectorAll(".datatable");
    if (tables.length > 0) {
        tables.forEach((table) => {
            initializeDataTableUno(table);
        });
    }
});



function initializeDataTable(table) {
    new DataTable(table, {
        order: [[0, 'desc']],
        paging: true,
        searching: true,
        info: true,
        language: {
            lengthMenu: `
                <label class="flex items-center space-x-1 text-sm">
                    <span>Mostrar</span>
                    <select class="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="-1">Todos</option>
                    </select>
                    <span>registros por página</span>
                </label>
            `,
            zeroRecords: "No se encontraron resultados",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay registros disponibles",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            search: "Buscar:",
            paginate: {
                previous: "Anterior",
                next: "Siguiente"
            }
        }
    });
}



function initializeDataTableUno(table) {
    new DataTable(table, {
        order: [[0, 'desc']],
        paging: true,
        searching: true,
        info: true,
        language: {
            lengthMenu: `
                <label class="flex items-center space-x-1 text-sm">
                    <span>Mostrar</span>
                    <select class="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="-1">Todos</option>
                    </select>
                    <span>registros por página</span>
                </label>
            `,
            zeroRecords: "No se encontraron resultados",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay registros disponibles",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            search: "Buscar:",
            paginate: {
                previous: "Anterior",
                next: "Siguiente"
            }
        }
    });
}
