@extends('layouts.vertical', ['title' => 'Productos', 'sub_title' => 'Pages', 'mode' => $mode ?? '', 'demo' => $demo ?? ''])

@section('content')
    @include('alerts.alert')



    <div  class="grid grid-cols-12">
        <div class="col-span-12">
            <h1 class="text-3xl font-extrabold text-gray-800 mb-6">
                <span class="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                    Gestión de artículos e ingredientes
                </span>
            </h1>

            <div id="ancla-section" class="p-6 card mt-10">
                <div data-fc-type="tab" class="">
                    <nav class="flex space-x-2 border-b border-gray-200 dark:border-gray-700" aria-label="Tabs" role="tablist">
                        <button data-fc-target="#card-type-tab-1" type="button"
                            class="fc-tab-active:bg-white fc-tab-active:border-b-transparent fc-tab-active:text-primary dark:fc-tab-active:bg-gray-800 dark:fc-tab-active:border-b-gray-800 dark:fc-tab-active:text-white -mb-px py-3 px-4 inline-flex items-center gap-2 bg-gray-50 text-sm font-medium text-center border text-gray-500 rounded-t-lg hover:text-gray-700 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400 active"
                            id="card-type-tab-item-1" aria-controls="card-type-tab-1" role="tab">
                            Productos
                            <i class="mgc_bread_line text-sm"></i>
                        </button>
                        <button data-fc-target="#card-type-tab-2" type="button"
                            class="fc-tab-active:bg-white fc-tab-active:border-b-transparent fc-tab-active:text-primary dark:fc-tab-active:bg-gray-800 dark:fc-tab-active:border-b-gray-800 dark:fc-tab-active:text-white -mb-px py-3 px-4 inline-flex items-center gap-2 bg-gray-50 text-sm font-medium text-center border text-gray-500 rounded-t-lg hover:text-gray-700 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            id="card-type-tab-item-2" aria-controls="card-type-tab-2" role="tab">
                            Categorías
                            <i class="mgc_department_line text-sm"></i>
                        </button>
                        <button data-fc-target="#card-type-tab-3" type="button"
                            class="fc-tab-active:bg-white fc-tab-active:border-b-transparent fc-tab-active:text-primary dark:fc-tab-active:bg-gray-800 dark:fc-tab-active:border-b-gray-800 dark:fc-tab-active:text-white -mb-px py-3 px-4 inline-flex items-center gap-2 bg-gray-50 text-sm font-medium text-center border text-gray-500 rounded-t-lg hover:text-gray-700 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            id="card-type-tab-item-3" aria-controls="card-type-tab-3" role="tab">
                            Ingredientes
                            <i class="mgc_carrot_line text-sm"></i>
                        </button>
                    </nav>

                    <div class="mt-3">
                        {{-- Productos --}}
                        <div id="card-type-tab-1" role="tabpanel" aria-labelledby="card-type-tab-item-1">
                            <div class="container mt-8">
                                @include('productos.articulos.articulos')
                            </div>
                        </div>

                        {{-- Categorias --}}
                        <div id="card-type-tab-2" class="hidden" role="tabpanel" aria-labelledby="card-type-tab-item-2">
                            <div class="container mt-8">


                                @include('productos.categoria.categoria')

                            </div>
                        </div>


                        {{-- Ingredientes --}}
                        <div id="card-type-tab-3" class="hidden" role="tabpanel" aria-labelledby="card-type-tab-item-3">
                            <div class="container mt-8">
                                @include('productos.ingrediente.ingrediente')
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>



    <!-- Modal de confirmación -->
    <div id="modal-confirm-delete" class="fixed inset-0 hidden flex items-center justify-center bg-black/50 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">¿Eliminar registro?</h2>
            <p id="modal-delete-message" class="mt-2 text-gray-600 dark:text-gray-400">
                Esta acción eliminará el registro y todos los datos relacionados. ¿Deseas continuar?
            </p>
            <div class="mt-4 flex justify-end gap-3">
                <button id="cancel-delete" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Cancelar
                </button>
                <button id="confirm-delete" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Eliminar
                </button>
            </div>
        </div>
    </div>
@endsection

@section('script-bottom')
    @vite(['resources/js/pages/products.js'])
@endsection
