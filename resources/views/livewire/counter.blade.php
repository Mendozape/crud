@extends('adminlte::page')
@section('title', 'LIVEWIRE')

@section('content_header')
@livewireStyles
@stop

@section('content'
<livewire:counter />
<div style="text-align: center">
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
@livewireScripts
@stop