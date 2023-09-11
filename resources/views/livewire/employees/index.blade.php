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
    livewire.on('saved', name => {
        document.getElementById("close_add").click();
        Swal.fire({
            icon: 'success',
            title: name,
            html: 'Was saved successfully',
            showConfirmButton: false,
            timer: 1500
        })
    })
    livewire.on('edited', name => {
        document.getElementById("close_edit").click();
        Swal.fire({
            icon: 'success',
            title: name,
            html: 'Was edited successfully',
            showConfirmButton: false,
            timer: 1500
        })
    })
    window.addEventListener('swal:confirm', event => {
        Swal.fire({
            title: 'Are you sure to delete?',
            html: event.detail.html,
            icon: 'warning',
            confirmButtonColor: '#d33',
            confirmButtonText: 'SURE?',
            cancelButtonColor: '#33cc33',
            cancelButtonText: 'CANCEL',
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                window.livewire.emit('destroy', event.detail.id)
            }
        })
    })
    window.addEventListener('swal:deleted', event => {
        Swal.fire({
            icon: 'success',
            title: event.detail.title,
            html: 'Was deleted succesfully',
            showConfirmButton: false,
            timer: 1500
        });
    });
</script>
@endsection
@section('js')
@vite(['resources/js/app.js'])
@endsection