@extends('adminlte::page')
@section('title', 'Dashboard')
@section('content_header')
	<div id="header"></div>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Clients</title>
@stop
@section('content_top_nav_right')
	<div id="TopNavDiv"></div>
@stop
@section('content')
    <div id="clients"></div>
@stop
@section('js')
	@viteReactRefresh
	@vite('resources/js/app.js')
@stop


@extends('adminlte::page')
@section('plugins.Sweetalert2', true)
@section('title', 'MY LARAVEL SYSTEM')
@include('top')
@section('content')
<section class="section">
  <div id="demo"></div>
  <div class="section-header" align="center">
    <h1>List</h1>
    @can('crear-cliente')
    <a href="{{ route('client.create') }}" class="btn btn-primary">Create lato</a>
    @endcan
  </div>
  <div class="section-body mt-2">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <table class="table" id="clientes">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Salary</th>
                  <th>Comments</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @forelse ($data as $details)
                <tr>
                  <td>{{ $details->name }}</td>
                  <td>{{ $details->due }}</td>
                  <td>{{ $details->comments }}</td>
                  <!--<td><img height="50px" src="{{ asset('storage/images/products/'.$details->image) }}" /></td>-->
                  <td><img height="50px" src="{{ asset('storage/'.$details->image)}}" /></td>
                  <td>
                    @can('editar-cliente')
                    <a href="{{ route('client.edit',$details) }}" class="btn btn-warning">Edit</a>
                    @endcan
                    @can('borrar-cliente')
                    <form action="{{ route('client.destroy',$details) }}" method="post" class="d-inline form-delete">
                      @method('DELETE')
                      @csrf
                      <BUTTON type="submit" class="btn btn-danger">Delete</BUTTON>
                    </form>
                    @endcan
                  </td>
                </tr>
                @empty
                <tr>
                  <td colspan="3">{{ __('No items found') }}</td>
                </tr>
                @endforelse
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>

</section>
@stop
@section('css')
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
@stop
@section('js')
@vite(['resources/js/app.js'])
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script src="https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js"></script>



<script>
  new DataTable('#clientes', {
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
@if (Session::has('user_deleted'))
<script>
  Swal.fire(
    'Borrado!',
    'El registro ha sido eliminado.',
    'success'
  )
</script>
@endif
@if (Session::has('user_edited'))
<script>
  Swal.fire(
    'Editado!',
    'El registro ha sido editado.',
    'success'
  )
</script>
@endif
@if (Session::has('user_added'))
<script>
  Swal.fire(
    'Agregado!',
    'El registro ha sido agregado.',
    'success'
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