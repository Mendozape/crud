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
    livewire.on('closdeleteEmployeee2', () => {
        Swal.fire('Any fool can use a computer')
    })
    window.addEventListener('closeModal', event => {
     $("#updateDataModal").modal('hide');
    })
    Livewire.on('borrar2', employeeId => {
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
                        Livewire.emitTo('employees', 'borrar', employeeId);
                        Swal.fire(
                            'Eliminado'
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
