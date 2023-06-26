@extends('adminlte::page')
@section('content_header')
    @livewireStyles
@stop

@section('content')
    @livewire('counter')
    @livewireScripts
@stop