@extends('adminlte::page')
@section('plugins.Sweetalert2', true)
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section" align="center">
  <div class="section-header">
    <h3 class="page_heading">Usuarios</h3>
  </div>
  <div class="section-body">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            @can('crear-usuario')
            <a href="{{ route('usuarios.create') }}" class="btn btn-warning"> Nuevo</a>
            <a href="{{ route('pdfList') }}" class="btn btn-warning"> Generar lista en PDF</a>
            <a href="{{ route('invoice') }}" class="btn btn-warning"> Generar factura</a>
            <a href="{{ route('export-users') }}" class="btn btn-warning"> Generar listado en excel</a>
            @endcan
            <table class="table">

              <head>
                <tr align="left">
                  <th style="display:none;">ID</th>
                  <th>Nombre</th>
                  <th>E-mail</th>
                  <th>Role</th>
                  <th>Permisos</th>
                  <th>Acciones</th>
                </tr>
              </head>
              <tbody>
                @foreach ($usuarios as $details)
                <tr>
                  <td style="display:none;">{{ $details->id }}</td>
                  <td>{{ $details->name }}</td>
                  <td>{{ $details->email }}</td>
                  <td>
                    @if(!empty($details->getRoleNames()))
                    @foreach($details->getRoleNames() as $roleName)
                    <h5><span class="btn btn-primary btn-sm">{{$roleName}}</span></h5>
                    @endforeach
                  </td>
                  <td>
                    @foreach($details->getAllPermissions()->pluck('name') as $permisos2)
                    <span class="btn btn-primary btn-sm">{{$permisos2}}</span> </br>
                    @endforeach
                    @endif
                  </td>
                  <td>
                    @can('editar-usuario')
                    <a href="{{ route('usuarios.edit',$details->id)}}" class="btn btn-info">Editar</a>
                    @endcan
                    @can('borrar-usuario')
                    <form action="{{ route('usuarios.destroy',$details->id) }}" method="post" class="d-inline form-delete">
                      @method('DELETE')
                      @csrf
                      <BUTTON type="submit" class="btn btn-danger">Eliminar</BUTTON>
                      @endcan
                    </form>
                  </td>
                </tr>
                @endforeach
              </tbody>
            </table>
            <div class="d-flex justify-content-center"> {!! $usuarios->links() !!} </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
@stop
@section('js')
@vite(['resources/js/app.js'])
@if (Session::has('user_deleted'))
<script>
  Swal.fire(
    'Borrado!',
    'El usuario ha sido eliminado.',
    'Exito'
  )
</script>
@endif
@if (Session::has('user_edited'))
<script>
  Swal.fire(
    'Editado!',
    'El usuario ha sido editado.',
    'Exito'
  )
</script>
@endif
@if (Session::has('user_added'))
<script>
  Swal.fire(
    'Agregado!',
    'El usuario ha sido agregado.',
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