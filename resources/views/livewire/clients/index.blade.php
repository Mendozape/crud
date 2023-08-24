@extends('adminlte::page')
@section('content_header')
    @livewireStyles
@stop
@section('content')
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-md-12">
            <livewire:clients />
        </div>
    </div>
</div>
@livewireScripts
@stop