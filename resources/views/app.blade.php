@extends('adminlte::page')

@section('title', 'Admin Panel')

@section('content')
    {{-- React root container --}}
    <div id="react-container"></div>
@stop

@section('js')
    {{-- Pass Laravel data to React --}}
    <script>
        window.Laravel = @json($data ?? []);
    </script>

    {{-- Load Vite React assets --}}
    @viteReactRefresh
    @vite('resources/js/ReactApp.jsx')
    @vite('resources/js/bootstrap.js')
@stop
