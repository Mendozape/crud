@extends('adminlte::page')
@section('content_header')
<livewire:styles />
@stop
@section('content')
    <livewire:employees />
    <livewire:scripts />
@stop
@section('js')
@vite(['resources/js/app.js'])
@stop