@extends('adminlte::page')

@section('title', 'Dashboard')

@section('content_header')
    {{-- Contenedor para TopNav u otro header de React --}}
    <div id="header"></div>
@stop

@section('content')
    {{-- Root div para la SPA de React --}}
    <div id="App" style="margin:0; padding:0;"></div>

    {{-- Pasar datos de Laravel a React --}}
    <script>
        window.Laravel = @json($data ?? []);
    </script>
@stop

@section('js')
    {{-- Vite React Refresh --}}
    @viteReactRefresh

    {{-- Importar main React App --}}
    @vite('resources/js/App.jsx')
@stop
