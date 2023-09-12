@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<div class="container py-5" align="left">
    @if($errors->any())
    <div class="alert alert-dark alert-dismissible fade show" role="alert">
        <strong>¡Revise los campos!</strong>
        @foreach($errors->all() as $error)
        <span class="badge badge-danger">{{$error}}</span>
        @endforeach
        <button type="button" class="close" data-dismiss="alert" aria-label="close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    @endif

    @if(isset($client))
    <h1>Editar</h1>
    @else
    <h1>Crear</h1>
    @endif
    @if(isset($client))
    <form action="{{ route('client.update',$client) }}" method="post" enctype="multipart/form-data">
        @method('PUT')
        @else
        <form action="{{ route('client.store') }}" method="post" enctype="multipart/form-data">
            @endif
            @csrf
            <div class="mb-3">
                <label for="name" class="form-label">Escribe tu Nombre</label>
                <input type="text" name="name" class="form-control" placeholder="Nombre del cliente" value="{{old('name') ?? @$client->name }}">
            </div>
            <div class="mb-3">
                <label for="due" class="form-label">Sueldo</label>
                <input type="text" name="due" class="form-control" placeholder="Saldo del cliente" step="0.01" value="{{ old('due') ?? @$client->due }}">
            </div>
            @if(isset($client))
            <div class="input-group mb-3">
                <img height="50px" src="{{ asset('storage/'.$client->image)}}" />
            </div>
            @endif
            <div class="input-group mb-3">
                <label for="ImageControl" />Seleccione imagen</label>
                <input type="file" class="form-control-file" name="image" id="inputGroupFile03" aria-describedby="inputGroupFileAddon03" aria-label="Upload">
            </div>
            <div class="mb-3">
                <label for="comments" class="form-label">Comentarios</label>
                <textarea name="comments" id="comments" cols="30" rows="10" class="form-control" placeholder="Escriba un comentario">{{old('comments') ?? @$client->comments}}</textarea>
            </div>
            @if(isset($client))
            <button type="submit" class="btn btn-info">Guardar cambios</button>
            @else
            <button type="submit" class="btn btn-info">Guardar clientes</button>
            @endif

        </form>
</div>
@stop