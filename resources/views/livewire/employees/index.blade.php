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
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
<!-- CDN de Sweetalert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>    

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
    /*window.addEventListener('swal',function(e){ 
        Swal.fire(e.detail);
    });*/

    /*livewire.on('close2', (postId) => {
     $('#updateDataModal' + postId).modal('hide');
 })*/
 Livewire.on('borrar2', studentId => {
                Swal.fire({
                    title: '¿Estas seguro que deseas eliminar al estudiante?',
                    text: "Esta acción no se puede revertir",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Borrar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Livewire.emitTo('employees', 'destroy', studentId);
                        Swal.fire(
                            'Eliminado',
                            'El estudiante ha sido eliminado',
                            'success'
                        )
                    }
                })
});
</script>
@endsection

@section('js')
@vite(['resources/js/app.js'])
@stop