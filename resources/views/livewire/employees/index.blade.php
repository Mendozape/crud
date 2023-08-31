@extends('adminlte::page')
@section('content_header')
    @livewireStyles
@stop
@section('content')
<div>
    <livewire:employees />
    @livewireScripts
</div>
    
@stop