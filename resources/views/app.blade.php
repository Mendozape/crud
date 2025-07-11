@extends('adminlte::page')

@section('title', 'Dashboard')

@section('content_header')
    <div id="header"></div>
@stop

@section('content')
    <div id="App"></div>
@stop

@section('js')
    @viteReactRefresh
    @vite('resources/js/AppRouter.jsx')
@stop