@extends('adminlte::page')

@section('content_header')
    @livewireStyles
@stop

@section('content')
    <livewire:clients />
    @livewireScripts
@stop
@section('css')
<link href="{{asset('css/app.css')}}" rel="stylesheet">
@stop