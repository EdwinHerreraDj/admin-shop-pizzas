@extends('layouts.vertical', ['title' => 'Inicio', 'sub_title' => 'Menu', 'mode' => $mode ?? '', 'demo' => $demo ?? ''])

@section('content')
    <div class="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-6">
        <!-- Botón Productos -->
        <a href="{{ route('productos') }}"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
            <div class="w-12 h-12 flex justify-center items-center rounded-full bg-primary/20 text-primary mb-4">
                <i class="mgc_bread_line text-2xl"></i>
            </div>
            <h5 class="text-lg font-semibold">Productos</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400">Gestiona las pizzas y demás artículos</p>
        </a>

        <!-- Botón Pedidos -->
        <a href="#"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
            <div class="w-12 h-12 flex justify-center items-center rounded-full bg-success/20 text-success mb-4">
                <i class="mgc_check_2_line text-2xl"></i>
            </div>
            <h5 class="text-lg font-semibold">Pedidos</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400">Consulta y administra pedidos</p>
        </a>

        <!-- Botón Usuarios -->
        <a href="#"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
            <div class="w-12 h-12 flex justify-center items-center rounded-full bg-info/20 text-info mb-4">
                <i class="mgc_group_line text-2xl"></i>
            </div>
            <h5 class="text-lg font-semibold">Usuarios</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400">Gestión de clientes y empleados</p>
        </a>

        <!-- Botón Ingredientes -->
        <a href="#"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
            <div class="w-12 h-12 flex justify-center items-center rounded-full bg-warning/20 text-warning mb-4">
                <i class="mgc_apple_line text-2xl"></i>
            </div>
            <h5 class="text-lg font-semibold">Ingredientes</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400">Control de ingredientes y extras</p>
        </a>
    </div>
    <!-- Grid End -->
    <div class="grid 2xl:grid-cols-4 gap-6 mb-6">
        <div class="2xl:col-span-3">




            <div class="grid lg:grid-cols-3 gap-6">
                <div class="col-span-1">
                    <div class="card">
                        <div class="p-6">
                            <h4 class="card-title">Objetivo Mensual</h4>

                            <div id="monthly-target" class="apex-charts my-8" data-colors="#FACC15,#22C55E"></div>

                            <div class="flex justify-center">
                                <div class="w-1/2 text-center">
                                    <h5>Pedidos Pendientes</h5>
                                    <p class="fw-semibold text-muted">
                                        <i class="mgc_round_fill text-yellow-500"></i> 28 pedidos
                                    </p>
                                </div>
                                <div class="w-1/2 text-center">
                                    <h5>Pedidos Entregados</h5>
                                    <p class="fw-semibold text-muted">
                                        <i class="mgc_round_fill text-success"></i> 134 pedidos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="lg:col-span-2">
                    <div class="card">
                        <div class="p-6">
                            <div class="flex justify-between items-center">
                                <h4 class="card-title">Estadísticas de Ventas</h4>

                                <div class="flex gap-2">
                                    <button type="button"
                                        class="btn btn-sm bg-primary/25 text-primary hover:bg-primary hover:text-white">
                                        Todo
                                    </button>
                                    <button type="button"
                                        class="btn btn-sm bg-gray-400/25 text-gray-400 hover:bg-gray-400 hover:text-white">
                                        6M
                                    </button>
                                    <button type="button"
                                        class="btn btn-sm bg-gray-400/25 text-gray-400 hover:bg-gray-400 hover:text-white">
                                        1Y
                                    </button>
                                </div>
                            </div>

                            <div dir="ltr" class="mt-2">
                                <div id="crm-project-statistics" class="apex-charts" data-colors="#F59E0B,#22C55E"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="col-span-1">
            <div class="card mb-6">
                <div class="px-6 py-5 flex justify-between items-center">
                    <h4 class="header-title">Resumen de Actividad</h4>
                    <div>
                        <button class="text-gray-600 dark:text-gray-400" data-fc-type="dropdown"
                            data-fc-placement="left-start" type="button">
                            <i class="mgc_more_1_fill text-xl"></i>
                        </button>

                        <div
                            class="hidden fc-dropdown fc-dropdown-open:opacity-100 opacity-0 w-36 z-50 mt-2 transition-[margin,opacity] duration-300 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                            <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm transition-all duration-300 bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                href="javascript:void(0)">
                                <i class="mgc_add_circle_line"></i> Añadir
                            </a>
                            <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm transition-all duration-300 bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                href="javascript:void(0)">
                                <i class="mgc_edit_line"></i> Editar
                            </a>
                            <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm transition-all duration-300 bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                href="javascript:void(0)">
                                <i class="mgc_copy_2_line"></i> Copiar
                            </a>
                            <div class="h-px bg-gray-200 dark:bg-gray-700 my-2 -mx-2"></div>
                            <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm transition-all duration-300 bg-transparent text-danger hover:bg-danger/5"
                                href="javascript:void(0)">
                                <i class="mgc_delete_line"></i> Eliminar
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Alerta principal -->
                <div class="px-4 py-2 bg-primary/20 text-primary" role="alert">
                    <i class="mgc_pizza_line me-1 text-lg align-baseline"></i>
                    <b>214</b> Pedidos totales este mes
                </div>

                <div class="p-6 space-y-3">
                    <!-- En preparación -->
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
                        <div class="flex-shrink-0 me-2">
                            <div class="w-12 h-12 flex justify-center items-center rounded-full text-warning bg-warning/25">
                                <i class="mgc_fire_line text-xl"></i>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <h5 class="font-semibold mb-1">Pedidos en preparación</h5>
                            <p class="text-gray-400">12 en cocina</p>
                        </div>
                        <div>
                            <button class="text-gray-400" data-fc-type="tooltip" data-fc-placement="top">
                                <i class="mgc_information_line text-xl"></i>
                            </button>
                            <div class="bg-slate-700 hidden px-2 py-1 rounded transition-all text-white opacity-0 z-50"
                                role="tooltip">
                                Pedidos que están siendo cocinados <div
                                    class="bg-slate-700 w-2.5 h-2.5 rotate-45 -z-10 rounded-[1px]" data-fc-arrow></div>
                            </div>
                        </div>
                    </div>

                    <!-- En reparto -->
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
                        <div class="flex-shrink-0 me-2">
                            <div class="w-12 h-12 flex justify-center items-center rounded-full text-info bg-info/25">
                                <i class="mgc_motorbike_line text-xl"></i>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <h5 class="fw-semibold my-0">Pedidos en reparto</h5>
                            <p>9 en camino</p>
                        </div>
                        <div>
                            <button class="text-gray-400" data-fc-type="tooltip" data-fc-placement="top">
                                <i class="mgc_information_line text-xl"></i>
                            </button>
                            <div class="bg-slate-700 hidden px-2 py-1 rounded transition-all text-white opacity-0 z-50"
                                role="tooltip">
                                Pedidos en proceso de entrega <div
                                    class="bg-slate-700 w-2.5 h-2.5 rotate-45 -z-10 rounded-[1px]" data-fc-arrow></div>
                            </div>
                        </div>
                    </div>

                    <!-- Entregados -->
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
                        <div class="flex-shrink-0 me-2">
                            <div
                                class="w-12 h-12 flex justify-center items-center rounded-full text-success bg-success/25">
                                <i class="mgc_check_circle_line text-xl"></i>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <h5 class="fw-semibold my-0">Pedidos entregados</h5>
                            <p>189 completados</p>
                        </div>
                        <div>
                            <button class="text-gray-400" data-fc-type="tooltip" data-fc-placement="top">
                                <i class="mgc_information_line text-xl"></i>
                            </button>
                            <div class="bg-slate-700 hidden px-2 py-1 rounded transition-all text-white opacity-0 z-50"
                                role="tooltip">
                                Pedidos entregados correctamente <div
                                    class="bg-slate-700 w-2.5 h-2.5 rotate-45 -z-10 rounded-[1px]" data-fc-arrow></div>
                            </div>
                        </div>
                    </div>

                    <!-- Cancelados -->
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
                        <div class="flex-shrink-0 me-2">
                            <div class="w-12 h-12 flex justify-center items-center rounded-full text-danger bg-danger/25">
                                <i class="mgc_close_circle_line text-xl"></i>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <h5 class="fw-semibold my-0">Pedidos cancelados</h5>
                            <p>4 anulados</p>
                        </div>
                        <div>
                            <button class="text-gray-400" data-fc-type="tooltip" data-fc-placement="top">
                                <i class="mgc_information_line text-xl"></i>
                            </button>
                            <div class="bg-slate-700 hidden px-2 py-1 rounded transition-all text-white opacity-0 z-50"
                                role="tooltip">
                                Pedidos cancelados por el cliente <div
                                    class="bg-slate-700 w-2.5 h-2.5 rotate-45 -z-10 rounded-[1px]" data-fc-arrow></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div> <!-- Grid End -->



    <div class="grid 2xl:grid-cols-4 md:grid-cols-2 gap-6">
        <div class="2xl:col-span-2 md:col-span-2">
            <div class="card">
                <div class="p-6">
                    <div class="flex justify-between items-center">
                        <h4 class="card-title">Resumen de Productos Vendidos</h4>
                        <div>
                            <button class="text-gray-600 dark:text-gray-400" data-fc-type="dropdown"
                                data-fc-placement="left-start" type="button">
                                <i class="mgc_more_2_fill text-xl"></i>
                            </button>

                            <div
                                class="hidden fc-dropdown fc-dropdown-open:opacity-100 opacity-0 w-36 z-50 mt-2 transition-[margin,opacity] duration-300 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                    href="javascript:void(0)">Hoy</a>
                                <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                    href="javascript:void(0)">Ayer</a>
                                <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    href="javascript:void(0)">Última Semana</a>
                                <a class="flex items-center gap-1.5 py-1.5 px-3.5 rounded text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    href="javascript:void(0)">Último Mes</a>
                            </div>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 items-center gap-4">
                        <!-- 🔹 Detalles de ventas -->
                        <div class="md:order-1 order-2">
                            <div class="flex flex-col gap-6">

                                <!-- Pizzas -->
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i
                                            class="mgc_round_fill h-10 w-10 flex justify-center items-center rounded-full bg-primary/25 text-lg text-primary"></i>
                                    </div>
                                    <div class="flex-grow ms-3">
                                        <h5 class="fw-semibold mb-1">Pizzas</h5>
                                        <ul class="flex items-center gap-2 text-gray-500">
                                            <li><b>124</b> vendidas</li>
                                            <li>
                                                <div class="w-1 h-1 rounded bg-gray-400"></div>
                                            </li>
                                            <li><b>4</b> empleados</li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Bocatas -->
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i
                                            class="mgc_round_fill h-10 w-10 flex justify-center items-center rounded-full bg-danger/25 text-lg text-danger"></i>
                                    </div>
                                    <div class="flex-grow ms-3">
                                        <h5 class="fw-semibold mb-1">Bocatas</h5>
                                        <ul class="flex items-center gap-2 text-gray-500">
                                            <li><b>87</b> vendidos</li>
                                            <li>
                                                <div class="w-1 h-1 rounded bg-gray-400"></div>
                                            </li>
                                            <li><b>3</b> empleados</li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Bebidas -->
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i
                                            class="mgc_round_fill h-10 w-10 flex justify-center items-center rounded-full bg-success/25 text-lg text-success"></i>
                                    </div>
                                    <div class="flex-grow ms-3">
                                        <h5 class="fw-semibold mb-1">Bebidas</h5>
                                        <ul class="flex items-center gap-2 text-gray-500">
                                            <li><b>152</b> vendidas</li>
                                            <li>
                                                <div class="w-1 h-1 rounded bg-gray-400"></div>
                                            </li>
                                            <li><b>2</b> empleados</li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Postres -->
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i
                                            class="mgc_round_fill h-10 w-10 flex justify-center items-center rounded-full bg-warning/25 text-lg text-warning"></i>
                                    </div>
                                    <div class="flex-grow ms-3">
                                        <h5 class="fw-semibold mb-1">Postres</h5>
                                        <ul class="flex items-center gap-2 text-gray-500">
                                            <li><b>45</b> vendidos</li>
                                            <li>
                                                <div class="w-1 h-1 rounded bg-gray-400"></div>
                                            </li>
                                            <li><b>1</b> empleado</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 🔹 Gráfico de resumen -->
                        <div class="md:order-2 order-1">
                            <div id="project-overview-chart" class="apex-charts"
                                data-colors="#3073F1,#ff679b,#0acf97,#ffbc00"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="col-span-1">
            <div class="card">
                <div class="card-header">
                    <div class="flex justify-between items-center">
                        <h4 class="card-title">Tareas Diarias</h4>
                        <div>
                            <select class="form-input form-select-sm">
                                <option selected>Hoy</option>
                                <option value="1">Ayer</option>
                                <option value="2">Mañana</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="py-6">
                    <div class="px-6" data-simplebar style="max-height: 304px;">
                        <div class="space-y-4">

                            <!-- Preparación de masa -->
                            <div class="border border-gray-200 dark:border-gray-700 rounded p-2">
                                <ul class="flex items-center gap-2 mb-2">
                                    <a href="javascript:void(0);" class="text-base text-gray-600 dark:text-gray-400">
                                        Preparación de masa
                                    </a>
                                    <i class="mgc_round_fill text-[5px]"></i>
                                    <h5 class="text-sm font-semibold">Hace 1 hora</h5>
                                </ul>
                                <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                    Amasar y dejar fermentar la masa para el turno del mediodía.
                                </p>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">
                                    <i class="mgc_group_line text-xl me-1 align-middle"></i> <b>3</b> empleados
                                </p>
                            </div>

                            <!-- Control de inventario -->
                            <div class="border border-gray-200 dark:border-gray-700 rounded p-2">
                                <ul class="flex items-center gap-2 mb-2">
                                    <a href="javascript:void(0);" class="text-base text-gray-600 dark:text-gray-400">
                                        Control de inventario
                                    </a>
                                    <i class="mgc_round_fill text-[5px]"></i>
                                    <h5 class="text-sm font-semibold">Hace 2 horas</h5>
                                </ul>
                                <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                    Revisar existencias de queso, salsa y bebidas para la jornada.
                                </p>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">
                                    <i class="mgc_group_line text-xl me-1 align-middle"></i> <b>2</b> empleados
                                </p>
                            </div>

                            <!-- Pedidos online -->
                            <div class="border border-gray-200 dark:border-gray-700 rounded p-2">
                                <ul class="flex items-center gap-2 mb-2">
                                    <a href="javascript:void(0);" class="text-base text-gray-600 dark:text-gray-400">
                                        Pedidos online
                                    </a>
                                    <i class="mgc_round_fill text-[5px]"></i>
                                    <h5 class="text-sm font-semibold">Hace 3 horas</h5>
                                </ul>
                                <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                    Confirmar pedidos recibidos a través de la web y asignar repartidores.
                                </p>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">
                                    <i class="mgc_group_line text-xl me-1 align-middle"></i> <b>4</b> empleados
                                </p>
                            </div>

                            <!-- Entregas a domicilio -->
                            <div class="border border-gray-200 dark:border-gray-700 rounded p-2">
                                <ul class="flex items-center gap-2 mb-2">
                                    <a href="javascript:void(0);" class="text-base text-gray-600 dark:text-gray-400">
                                        Entregas a domicilio
                                    </a>
                                    <i class="mgc_round_fill text-[5px]"></i>
                                    <h5 class="text-sm font-semibold">Hace 4 horas</h5>
                                </ul>
                                <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                    Coordinar repartos pendientes con los motorizados disponibles.
                                </p>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">
                                    <i class="mgc_group_line text-xl me-1 align-middle"></i> <b>3</b> repartidores
                                </p>
                            </div>

                            <!-- Limpieza del área -->
                            <div class="border border-gray-200 dark:border-gray-700 rounded p-2">
                                <ul class="flex items-center gap-2 mb-2">
                                    <a href="javascript:void(0);" class="text-base text-gray-600 dark:text-gray-400">
                                        Limpieza del área de trabajo
                                    </a>
                                    <i class="mgc_round_fill text-[5px]"></i>
                                    <h5 class="text-sm font-semibold">Hace 5 horas</h5>
                                </ul>
                                <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                    Limpieza de mesas, hornos y utensilios tras el servicio de la mañana.
                                </p>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">
                                    <i class="mgc_group_line text-xl me-1 align-middle"></i> <b>2</b> empleados
                                </p>
                            </div>

                            <!-- Animación de carga -->
                            <div class="flex items-center justify-center">
                                <div class="animate-spin flex">
                                    <i class="mgc_loading_2_line text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div> <!-- Grid End -->
@endsection

@section('script')
    @vite('resources/js/pages/dashboard.js')
@endsection
