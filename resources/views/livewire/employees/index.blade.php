@extends('adminlte::page')
@section('content_header')
<livewire:styles />
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
<meta name="csrf-token" content="{{ csrf_token() }}">
<script src="https://cdnjs.cloudflare.com/ajax/libs/pusher/8.3.0/pusher.min.js" integrity="sha512-tXL5mrkSoP49uQf2jO0LbvzMyFgki//znmq0wYXGq94gVF6TU0QlrSbwGuPpKTeN1mIjReeqKZ4/NJPjHN1d2Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/laravel-echo/1.15.3/echo.js"></script>
@stop
@include('toplw')
@section('content')
            @livewire('employees')
@livewireScripts
<script>
/////////START THE PUSHER
    // Enable pusher logging - don't include this in production
    //Pusher.logToConsole = true;
    var pusher = new Pusher('66e12194484209bfb23d', {
        cluster: 'mt1'
    });
    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
        //alert(JSON.stringify(data.username));
        document.getElementById("NumNoti").textContent = 9;
        //document.getElementById("demo").innerHTML ='sdfsf';
    });
    var channel = pusher.subscribe('EmployeesChannel');
    channel.bind('EmployeesEvent', function(event) {
        //alert(JSON.stringify(data.username));
        //event.unread.foreach(function(row){
        document.getElementById("NumMess").textContent = event.NumNoti;
        document.getElementById("notis").innerHTML =event.unread;
        //livewire.emit('UpdateCompo');
        //alert('asdad');
        //alert(JSON.stringify('asdsad:'+event.unread[0].data['name']));
        //alert(JSON.stringify(html));
        //})
    });
///////////END THE PUSHER
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
    /*Livewire.on('xxx', postId => {
            alert('A post was added with the id of: ' );
    })*/
</script>
@endsection
@section('js')
@vite(['resources/js/app.js'])
@endsection