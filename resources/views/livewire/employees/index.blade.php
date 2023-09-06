@extends('adminlte::page')
@section('content_header')
<livewire:styles />
@stop
@section('content')
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-md-12">
            @livewire('employees')
        </div>
    </div>
</div>
@livewireScripts
<script>
    Livewire.on('deleteEmployee')
    Swal.fire(
    'Borrado!',
    'El usuario ha sido eliminado.',
    'Exito'
  )

    window.addEventListener('closeModal', event => {
     $("#updateDataModal").modal('hide');
    })
    Livewire.on('deleteEmployee', employeeId => {
                Swal.fire({
                    title: '¿Estas seguro que deseas eliminar el empleado?',
                    text: "Esta acción no se puede revertir",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Borrar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Livewire.emitTo('employees', 'destroy', employeeId);
                        Swal.fire(
                            'Eliminado',
                            'El empleado ha sido eliminado',
                            'success'
                        )
                    }
                })
    });
    livewire.on('close2', (postId) => {
     $('#updateDataModal' + postId).modal('hide');
 })
</script>
@endsection

@section('js')
@vite(['resources/js/app.js'])
@stop
