@extends('adminlte::page')
@section('title', 'CT MORELIA')
@section('content')
<div class="container py-5" align="center">
    <h1>Listado</h1>
      <a href="{{ route('usuarios.create') }}" class="btn btn-primary"> Nuevo</a>
    <table class="table" align="left">
        <tr align="left">
            <th>Nombre</th>
            <th>Saldo</th>
            <th>Imagen</th>
            <th>Comentarios</th>
            <th>Acciones</th>
        </tr>
    </table>
    {{ $clientes->links() }}
</div>
  @stop