@extends('layouts.vertical', ['title' => 'Ingredientes', 'sub_title' => 'Pages', 'mode' => $mode ?? '', 'demo' => $demo ?? ''])

@section('content')
    <div id="articulo-ingredientes-root" data-articulo-id="{{ $articulo->id }}"></div>
@endsection
