@extends('adminlte::page')

@section('title', 'Dashboard')

@push('head')
    <style>
        /* ESTILOS PARA NUESTRO TOPNAV REACT */
        .react-topnav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 57px;
            background: #fff;
            border-bottom: 1px solid #dee2e6;
            z-index: 1030;
            display: flex;
            align-items: center;
            padding: 0 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Ajustar el contenido principal */
        .content-wrapper {
            margin-top: 57px !important;
        }

        /* Burger icon - IZQUIERDA */
        .burger-button {
            border: none;
            background: none;
            cursor: pointer;
            padding: 10px;
            margin-right: 15px;
            font-size: 18px;
            color: #4a4a4a;
        }

        /* CONTENEDOR DERECHO - FLEX:1 para ocupar todo el espacio sobrante */
        .nav-right-container {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1; /* Esto es clave */
            justify-content: flex-end; /* Alinea todo a la derecha */
        }

        /* Botones derechos */
        .nav-right-button {
            border: none;
            background: none;
            cursor: pointer;
            padding: 8px;
            font-size: 16px;
            color: #4a4a4a;
            border-radius: 4px;
        }

        .nav-right-button:hover {
            background: #f8f9fa;
        }
    </style>
@endpush

@section('content')
    {{-- Navbar de React --}}
    <div class="react-topnav" id="react-topnav"></div>

    {{-- Contenido principal --}}
    <div id="App"></div>

    <script>
        window.Laravel = @json($data ?? []);
    </script>
@stop

@section('js')
    @viteReactRefresh
    @vite('resources/js/App.jsx')
@stop