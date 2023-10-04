@extends('adminlte::page')
@section('plugins.Sweetalert2', true)
@section('title', 'MY LARAVEL SYSTEM')
@section('content_header')
<!-- CSRF Token -->
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/laravel-echo/1.15.3/echo.js"></script>
  <script>
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;
    var pusher = new Pusher('66e12194484209bfb23d', {
      cluster: 'mt1'
    });
    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
      alert(JSON.stringify(data.message));
      //alert('testing');
      //console.log('testing');
    });
    //console.log('testingxxy');
    //alert('testing');
  </script>
@stop
@section('content')
<section class="section">
  <div class="section-header" align="center" >
    <h1>Email</h1>
  </div>
  <div class="section-body mt-2">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <table class="table" id="clientes">
              <tbody>
                <tr>
                    <td class="text-center">The Data Base notification was sent successfully</td>
                    </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
@endsection
@section('js')
  @vite(['resources/js/app.js'])
@endsection