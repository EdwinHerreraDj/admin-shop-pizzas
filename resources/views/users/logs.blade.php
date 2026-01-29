@extends('layouts.vertical', ['title' => 'Registros de Login', 'sub_title' => 'Pages', 'mode' => $mode ?? '', 'demo' => $demo ?? ''])

@section('css')
    <link href="https://cdn.datatables.net/v/dt/dt-2.1.8/datatables.min.css" rel="stylesheet">
@endsection


@section('content')
    <div class="grid grid-cols-12">
        <div class="col-span-12">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <div class="card p-6">
                        <h2 class="text-xl font-semibold mb-4">Usuarios</h2>
                        <div class="overflow-x-auto relative">


                            <table id="table-data" class="display">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>IP</th>
                                        <th>Navegador</th>
                                        <th>Inicio de sesion</th>
                                        <th>Cierre de Sesión</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($logs as $log)
                                        <tr>
                                            <td>{{ $log->id }}</td>
                                            <td>{!! $log->user->name ?? '<span class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-100 text-red-800"><span class="w-1.5 h-1.5 inline-block bg-red-400 rounded-full"></span>Activo</span>' !!}</td>
                                            <td>{{ $log->ip_address }}</td>
                                            <td>{{ $log->user_agent }}</td>
                                            <td>{{ $log->logged_in_at }}</td>
                                            <td>
                                                {!! $log->logged_out_at ??
                                                    '<span class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-100 text-green-800"><span class="w-1.5 h-1.5 inline-block bg-green-400 rounded-full"></span>Activo</span>' 
                                                !!}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection


@section('script-bottom')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/v/dt/dt-2.1.8/datatables.min.js"></script>
@endsection
