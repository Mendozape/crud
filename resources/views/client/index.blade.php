@extends('adminlte::page')
@section('title', 'CT MORELIA')
@section('content')
<div class="container py-5" align="center">
    <h1>Listado de clientes</h1>
    <a href="{{ route('client.create') }}" class="btn btn-primary"> Crear Clientes</a>
   
      @if (Session::has('user_added'))
         <div class="alert alert-info my-5">
          {{ Session::get('user_added')}}
         </div>
      @endif
      @if (Session::has('user_edited'))
        <div class="alert alert-info my-5">
        {{ Session::get('user_edited')}}
        </div>
      @endif
      @if (Session::has('user_deleted'))
        <div class="alert alert-info my-5">
        {{ Session::get('user_deleted')}}
        </div>
      @endif
    <table class="table" align="center">
        <tr align="center">
            <th>Nombre</th>
            <th>Saldo</th>
            <th>Imagen</th>
            <th>Comentarios</th>
            <th>Acciones</th>
        </tr>
        <tbody align="center">
          @forelse ($clientes as $details)
            <tr>
              <td>{{ $details->name }}</td>
              <td>{{ $details->due }}</td>
              <td><img height="50px" src="{{ asset('storage/images/products/'.$details->image)}}" /></td>
              <td>{{ $details->comments }}</td>
              <td>
                <a href="{{ route('client.edit',$details) }}" class="btn btn-warning">Editar</a>
                <form action="{{ route('client.destroy',$details) }}" method="post" class="d-inline">
                  @method('DELETE')
                    @csrf
                    <BUTTON type="submit" class="btn btn-danger" onclick="return confirm('Estas seguro de eliminar este cliente?')">Eliminar</BUTTON>
                </form>
              </td>
            </tr>
          @empty
          <tr>
            <td colspan="3">No hay registros</td>
          </tr>
          @endforelse
        </tbody>
    </table>
    {{ $clientes->links() }}
  </div>
  @stop