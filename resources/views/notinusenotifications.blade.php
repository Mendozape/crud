@extends('adminlte::page')
@section('title', 'Notifications')
@section('content')
    <div id="react-container"></div>
@stop
@section('js')
    @viteReactRefresh
    @vite('resources/js/ReactApp.jsx')
@stop