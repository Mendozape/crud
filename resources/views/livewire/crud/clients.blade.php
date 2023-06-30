<section class="section">
    <div class="section-header p-2" align="center">
        <h1>Listado</h1>
        @can('crear-cliente')
        <a href="{{ route('client.create') }}" class="btn btn-primary"> Altas</a>
        @endcan
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <div class="flex justify-between">

                            
                            
                            <div class="d-flex flex-row bd-highlight mb-3">
                                <div class="p-2 bd-highlight">Flex item 4</div>
                                <div class="p-2 bd-highlight">Flex item 5</div>
                                <div class="p-2 bd-highlight">Flex item 6</div>
                            </div>
                            <div class="d-flex flex-row bd-highlight mb-3">
                                <div class="p-2 bd-highlight">Flex item 1</div>
                                <div class="p-2 bd-highlight">Flex item 2</div>
                                <div class="p-2 bd-highlight">Flex item 3</div>
                            </div>
                            <div class="d-flex flex-row bd-highlight mb-3">
                                Saldo mayor a ?
                            </div>
                            
                        </div>
                        <table class="table">
                            <tr>
                                <th>Nombre</th>
                                <th>Salario</th>
                                <th>Comentarios</th>
                                <th>Imagen</th>
                                <th>Acciones</th>
                            </tr>
                            <tbody>
                                @forelse ($clientes as $details)
                                <tr>
                                    <td>{{ $details->name }}</td>
                                    <td>{{ $details->due }}</td>
                                    <td>{{ $details->comments }}</td>
                                    <!--<td><img height="50px" src="{{ asset('storage/images/products/'.$details->image) }}" /></td>-->
                                    <td><img height="50px" src="{{ asset('images/'.$details->image)}}" /></td>
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