@extends('adminlte::page')
@section('title', 'LIVEWIRE')
@section('content')
<html>
<head>
    @livewireStyles
</head>
<body>
    <section class="section" align="center">
        <livewire:counter />
        <div style="text-align: center">
            <button wire:click="increment">+</button>
            <h1>{{ $count }}</h1>
        </div>
        @livewireScripts
    </section>
</body>
</html>
@stop