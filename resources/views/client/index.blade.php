@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<<<<<<< HEAD
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
=======
<section class="section">
  <div class="section-header" align="center">
    <h1>Listado</h1>
    @can('editar-cliente')
    <a href="{{ route('client.create') }}" class="btn btn-primary"> Altas</a>
    @endcan
>>>>>>> 572bdba48657fdb5a1b1774794eac02d49a7bdbd
  </div>
  <div class="section-body">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <table class="table">
              <tr>
                <th>Nombre</th>
                <th>Saldo</th>
                <th>Imagen</th>
                <th>Comentarios</th>
                <th>Acciones</th>
              </tr>
              <tbody>
                @forelse ($clientes as $details)
                <tr>
                  <td>{{ $details->name }}</td>
                  <td>{{ $details->due }}</td>
                  <td>{{ $details->comments }}</td>
                  <td><img height="50px" src="{{ asset('storage/images/products/'.$details->image)}}" /></td>
                  <td>

                    @can('editar-cliente')
                    <a href="{{ route('client.edit',$details) }}" class="btn btn-warning">Editar</a>
                    @endcan
                    @can('borrar-cliente')
                    <form action="{{ route('client.destroy',$details) }}" method="post" class="d-inline form-delete">
                      @method('DELETE')
                      @csrf
                      <BUTTON type="submit" class="btn btn-danger">Eliminar</BUTTON>
                    </form>
                    @endcan
                  </td>
                </tr>
                @empty
                <tr>
                  <td colspan="3">No hay registros</td>
                </tr>
                @endforelse
              </tbody>
            </table>
            <div class="pagination justify-content-center"> {!! $clientes->links() !!} </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
@stop
@section('js')
<script src="{{asset('js/app.js')}}"></script>
@if (Session::has('user_deleted'))
<script>
  Swal.fire(
    'Borrado!',
    'El registro ha sido eliminado.',
    'Exito'
  )
</script>
@endif
@if (Session::has('user_edited'))
<script>
  Swal.fire(
    'Editado!',
    'El registro ha sido editado.',
    'Exito'
  )
</script>
@endif
@if (Session::has('user_added'))
<script>
  Swal.fire(
    'Agregado!',
    'El registro ha sido agregado.',
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