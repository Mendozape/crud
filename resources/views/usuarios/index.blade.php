@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<div class="container py-5" align="center">
    <h1>Listado</h1>
    <a href="{{ route('usuarios.create') }}" class="btn btn-primary"> Nuevo</a>
    <table class="table" align="left">

        <head>
            <tr align="left">
                <th style="display:none;">ID</th>
                <th>Nombre</th>
                <th>E-mail</th>
                <th>Rol</th>
                <th>Acciones</th>
            </tr>
        </head>
        <tbody align="left">
            @foreach ($usuarios as $details)
            <tr>
                <td style="display:none;">{{ $details->id }}</td>
                <td>{{ $details->name }}</td>
                <td>{{ $details->email }}</td>
                <td>
                    @if(!empty($details->getRoleNames()))
                    @foreach($details->getRoleNames() as $roleName)
                    <h5><span class="btn btn-danger">{{$roleName}}</span></h5>
                    @endforeach
                    @endif
                </td>
                <td>
                    <a href="{{ route('usuarios.edit',$details->id)}}" class="btn btn-info">Editar</a>
                    <form action="{{ route('usuarios.destroy',$details->id) }}" method="post" class="d-inline">
                        @method('DELETE')
                        @csrf
                        <BUTTON type="submit" class="btn btn-danger" onclick="return confirm('Estas seguro de eliminar este cliente?')">Eliminar</BUTTON>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="pagination justify-content-end">
        {{ $usuarios->links() }}
    </div>

</div>
@stop