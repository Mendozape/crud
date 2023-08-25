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
                        <table class="table" id="roles">
                            <thead>
                                <tr align="left">
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
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
@section('css')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
<link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css">
@stop
@section('js')
@vite(['resources/js/app.js'])
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script src="https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js"></script>
<script src="https://cdn.datatables.net/responsive/2.5.0/js/responsive.bootstrap5.min.js"></script>
<script>
    new DataTable('#roles', {
        responsive: true,
        autoWidth: false,
        pageLength: 5,
        lengthMenu: [
            [5, 10, 20, -1],
            [5, 10, 20, 'Todos']
        ],
        "language": {
            info: 'mostrando página _PAGE_ de _PAGES_',
            infoEmpty: 'No registros encontrados',
            infoFiltered: '(filtered from _MAX_ total records)',
            lengthMenu: 'mostrando _MENU_ registros por página',
            zeroRecords: 'No registros encontrados',
            paginate: {
                previous: "anterior",
                next: "siguiente"
            }
        }
    });
</script>
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