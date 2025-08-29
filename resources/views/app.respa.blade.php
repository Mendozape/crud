{{-- resources/views/spa.blade.php --}}
@extends('adminlte::page')
@section('title', 'Dashboard')
@section('content_header')
    <div id="header"></div>
@stop
@section('content')
    <div id="Principal"></div>
@stop
@section('js')
    @viteReactRefresh
    @vite('resources/js/HomeContent.jsx')
@stop
