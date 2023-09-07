@extends('adminlte::page')
@section('content_header')
<livewire:styles />
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
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
    /*livewire.on('closdeleteEmployeee2', () => {
        Swal.fire('Any fool can use a computer')
    })
    window.addEventListener('closeModal', event => {
     $("#updateDataModal").modal('hide');
    })*/
    /*Livewire.on('borrar2', employeeId => {
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
                        //document.addEventListener('livewire:init', () => {
                            Livewire.emitTo('employees', 'destroy', employeeId);
                        //})
                        Swal.fire(
                            'Eliminado'
                        )
                    }
                })
    });*/
    document.addEventListener('borrar2', function() {
        @this.on('borrar2', id => {
            Swal.fire({
                title: 'Are You Sure?',
                html: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
            }).then((result) => {
                if (result.value) {
                    @this.call('destroy', id)
                }
            });
        });
    })

    /*livewire.on('close2', (postId) => {
     $('#updateDataModal' + postId).modal('hide');
 })*/
</script>
@endsection
@push('scripts')
@endpush
@section('js')
@vite(['resources/js/app.js'])
@stop