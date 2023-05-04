@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('plugins.Datatables', true)
@section('content')
<section class="section">
  <div class="section-header">
    <h1>Listado</h1>
    @can('editar-cliente')
    <a href="{{ route('client.create') }}" class="btn btn-primary"> Altas</a>
    @endcan
    @if (Session::has('user_added'))
    {{ Session::get('user_added')}}
    @endif
    @if (Session::has('user_edited'))
    {{ Session::get('user_edited')}}
    @endif
    @if (Session::has('user_deleted'))
    {{ Session::get('user_deleted')}}
    @endif
  </div>
  <div class="section-body">
    <div class="row">
      <div class="clo-lg-12">
        <div class="card">
          <div class="card-body">
            <table class="table" border="1">
              <tr align="left">
                <th>Nombre</th>
                <th>Saldo</th>
                <th>Imagen</th>
                <th>Comentarios</th>
                <th>Acciones</th>
              </tr>
              <tbody align="left">
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
                    <form action="{{ route('client.destroy',$details) }}" method="post" class="d-inline">
                      @method('DELETE')
                      @csrf
                      <BUTTON type="submit" class="btn btn-danger" onclick="return confirm('Estas seguro de eliminar este cliente?')">Eliminar</BUTTON>
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
            <div class="pagination justify-content-end"> {!! $clientes->links() !!} </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
@stop