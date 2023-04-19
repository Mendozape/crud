@extends('adminlte::page')
@section('title', 'CT MORELIA')
@section('content')
<div class="container py-5" align="left">
    @if(isset($client))
        <h1>Editar clientes</h1>
    @else
    <h1>Crear de clientes</h1>
    @endif

    @if(isset($client))
        <form action="{{ route('client.update',$client) }}" method="post" >
            @method('PUT')
    @else
        <form action="{{ route('client.store') }}" method="post" >
    @endif
    
    @csrf
    <div class="mb-3">
        <label for="name" class="form-label">Nombre</label>
        <input type="text" name="name" class="form-control" placeholder="Nombre del cliente"  value="{{old('name') ?? @$client->name }}">
        <p class="form-text">Escriba el nombre el cliente </p>
        @error('name')
            <p class="form-text text-danger">{{$message}}</p>
        @enderror
    </div>
    <div class="mb-3">
        <label for="due" class="form-label">Saldo</label>
        <input type="text" name="due" class="form-control" placeholder="Saldo del cliente" step="0.01" value="{{ old('due') ?? @$client->due }}">
        <p class="form-text">Escriba saldo del cliente </p>
        @error('due')
            <p class="form-text text-danger">{{$message}}</p>
        @enderror
    </div>
    <div class="mb-3">
        <label for="comments" class="form-label">Comentarios</label>
        <textarea name="comments" id="comments" cols="30" rows="10" class="form-control" placeholder="Escriba un comentario" >{{old('comments') ?? @$client->comments}}</textarea>
        <p class="form-text">Escriba escriba un comentario </p>
        @error('commments')
            <p class="form-text text-danger">{{$message}}</p>
        @enderror
    </div>
    @if(isset($client))
        <button type="submit" class="btn btn-info">Editar clientes</button>
    @else
        <button type="submit" class="btn btn-info">Guardar clientes</button>
    @endif
    
</form>
</div>
@stop