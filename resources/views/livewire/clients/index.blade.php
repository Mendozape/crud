@extends('adminlte::page')
@section('content_header')
    @livewireStyles
@stop
@section('content')
    <livewire:clients />
    @livewireScripts
@stop
@section('js')
@vite(['resources/js/app.js'])
@stop