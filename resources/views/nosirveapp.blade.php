@extends('adminlte::page')
@section('title', 'Admin Panel')
@section('content')
    <div id="react-container"></div>
@stop
@section('js')
    <script>
        window.Laravel = @json($data);
    </script>
    @viteReactRefresh
    @vite('resources/js/ReactApp.jsx')
@stop
