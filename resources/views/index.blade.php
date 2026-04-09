@extends('layouts.vertical', ['title' => 'Dashboard', 'sub_title' => 'Menu', 'mode' => $mode ?? '', 'demo' => $demo ?? ''])

@section('content')
    <div id="dashboard-root"></div>
@endsection
