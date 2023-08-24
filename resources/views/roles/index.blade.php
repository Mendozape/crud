@extends('adminlte::page')
@section('plugins.Sweetalert2', true)
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section" align="center">
    <div class="section-header">
        <h3 class="page_heading">Roles</h3>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        @can('crear-rol')
                        <a href="{{ route('roles.create') }}" class="btn btn-warning"> Nuevo</a>
                        @endcan
                        <table class="table">

                            <head>
                                <tr align="left">
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </head>
                            <tbody>
                                @foreach ($roles as $role)
                                <tr>
                                    <td>{{$role->name}}</td>    
                                    <td>
                                        @can('editar-rol')
                                            <a href="{{ route('roles.edit',$role->id) }}" class="btn btn-primary"> Editar</a>
                                        @endcan
                                        @can('borrar-rol')
                                        {!! Form::open(['method'=>'DELETE','class' => 'd-inline form-delete', 'style'=>'display:inline', 'route'=>['roles.destroy',$role->id]]) !!}
                                            {!! Form::submit('Borrar',['class'=>'btn btn-danger']) !!}
                                        {!! Form::close() !!}
                                        @endcan
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                        <div class="d-flex justify-content-center"> {!! $roles->links() !!} </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop
@section('js')
@vite(['resources/js/app.js'])
@if (Session::has('role_deleted'))
<script>
    Swal.fire(
        'Borrado!',
        'El role ha sido eliminado.',
        'Exito'
    )
</script>
@endif
@if (Session::has('role_edited'))
<script>
    Swal.fire(
        'Editado!',
        'El role ha sido editado.',
        'Exito'
    )
</script>
@endif
@if (Session::has('role_added'))
<script>
    Swal.fire(
        'Agregado!',
        'El role ha sido agregado.',
        'Exito'
    )
</script>
@endif
<script>
    $('.form-delete').submit(function(e) {
        e.preventDefault();
        Swal.fire({
            title: 'Está seguro?',
            text: "No se podrá revertir!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Eliminarlo!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.submit();
            }
        })
    });
</script>
@stop