@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section" align="center">
    <div class="section-header">
        <h3 class="page_heading">Permisos</h3>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        @can('crear-permisos')
                        <a href="{{ route('permisos.create') }}" class="btn btn-warning"> Nuevo</a>
                        @endcan
                        <table class="table">

                            <head>
                                <tr align="left">
                                    <th>Permiso</th>
                                    <th>Acciones</th>
                                </tr>
                            </head>
                            <tbody>
                                @foreach ($permisos as $permiso)
                                <tr>
                                    <td>{{$permiso->name}}</td>    
                                    <td>
                                        @can('editar-permiso')
                                            <a href="{{ route('permisos.edit',$permiso->id) }}" class="btn btn-primary"> Editar</a>
                                        @endcan
                                        @can('borrar-permiso')
                                        {!! Form::open(['method'=>'DELETE','class' => 'd-inline form-delete', 'style'=>'display:inline', 'route'=>['permisos.destroy',$permiso->id]]) !!}
                                            {!! Form::submit('Borrar',['class'=>'btn btn-danger']) !!}
                                        {!! Form::close() !!}
                                        @endcan
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                        <div class="d-flex justify-content-center"> {!! $permisos->links() !!} </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop

@section('js')
<script src="{{asset('js/app.js')}}"></script>
@if (Session::has('permiso_deleted'))
<script>
    Swal.fire(
        'Borrado!',
        'El permiso ha sido eliminado.',
        'Exito'
    )
</script>
@endif
@if (Session::has('permiso_edited'))
<script>
    Swal.fire(
        'Editado!',
        'El permiso ha sido editado.',
        'Exito'
    )
</script>
@endif
@if (Session::has('permiso_added'))
<script>
    Swal.fire(
        'Agregado!',
        'El permiso ha sido agregado.',
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