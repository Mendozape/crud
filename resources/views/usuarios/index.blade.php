@extends('adminlte::page')
@section('title', 'CT MORELIA')
@section('content')
<div class="container py-5" align="center">
    <h1>Listado</h1>
    <a href="{{ route('usuarios.create') }}" class="btn btn-primary"> Nuevo</a>
    <table class="table" align="left">
        <tr align="left">
            <th>Nombre</th>
            <th>E-mail</th>
            <th>Rol</th>
            <th>Acciones</th>
        </tr>
        <tbody align="left">
            @foreach ($usuarios as $details)
            <tr>
                <td>{{ $details->name }}</td>
                <td>{{ $details->email }}</td>
                <td>
                    @if(!empty($details->getRoleNames()))
                        @foreach($details->getRoleNames as $roleName)
                            <h5><span class="badge badge-dark">{{$roleName}}</span></h5>
                        @endforeach
                    @endif
                </td>
                <td>{{ $details->email }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    {{ $usuarios->links() }}
</div>
@stop