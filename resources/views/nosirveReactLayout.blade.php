@extends('adminlte::page')
@section('title', $title ?? 'Dashboard')
@section('content_header')
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
@stop

@section('content')
    <div id="react-container"></div>
@stop

@section('js')
    @viteReactRefresh
    @vite('resources/js/ReactApp.jsx')
@stop