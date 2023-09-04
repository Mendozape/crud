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
@endsection
@section('js')
@vite(['resources/js/app.js'])
<script>
    window.addEventListener('closeModal', event => {
        //$('#updateDataModal').modal('hide');
        $('#updateDataModal').removeClass('in');
        $('.modal-backdrop').remove();
        $('#updateDataModal').hide();
        //$("#updateDataModal").modal("hide");
        /*$("#updateDataModal").removeClass("in");
        $(".modal-backdrop").remove();
        $('body').removeClass('modal-open');
        $('body').css('padding-right', '');
        $("#updateDataModal").hide();*/
        $('#updateDataModal').on('shown', function () {
      $('#updateDataModal').modal('hide');
})
    })
</script>
@stop