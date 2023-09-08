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
@stack('js');
<script>
    livewire.on('saved', name => {
        document.getElementById("close_add").click();
        Swal.fire({
            icon: 'success',
            title: 'The employee '+ name +' was saved successfully',
            showConfirmButton: false,
            timer: 1500
        })
    })
    livewire.on('edited', name => {
        document.getElementById("close_edit").click();
        Swal.fire({
            icon: 'success',
            title: 'The employee '+ name +' was edited successfully',
            showConfirmButton: false,
            timer: 1500
        })
    })
    livewire.on('test', name => {
        Swal.fire({
            icon: 'success',
            title: 'si paso por DESTROY',
            showConfirmButton: false,
            timer: 1500
        })
    })
</script>
@endsection

@section('js')
@vite(['resources/js/app.js'])
@endsection