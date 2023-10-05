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
    //Pusher.logToConsole = true;
    var pusher = new Pusher('66e12194484209bfb23d', {
      cluster: 'mt1'
    });
    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
      //alert(JSON.stringify(data.username));
      document.getElementById("NumNoti").textContent=data.username;
    });
  </script>
@stop
@section('content_top_nav_right')
<li class="nav-item dropdown">
    <a class="nav-link" data-toggle="dropdown" href="#" aria-expanded="false">
        <i class="far fa-comments"></i>
        <span class="badge badge-warning navbar-badge">6</span>
    </a>
    <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right" style="left: inherit; right: 0px;">
        <span class="dropdown-item dropdown-header">15 Notifications</span>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
            <i class="fas fa-envelope mr-2"></i> 4 new messages
            <span class="float-right text-muted text-sm">3 mins</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
            <i class="fas fa-users mr-2"></i> 8 friend requests
            <span class="float-right text-muted text-sm">12 hours</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
            <i class="fas fa-file mr-2"></i> 3 new reports
            <span class="float-right text-muted text-sm">2 days</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
    </div>
</li>
<li class="nav-item dropdown">
    <a class="nav-link" data-toggle="dropdown" href="#" aria-expanded="false">
        <i class="far fa-bell"></i>
        <span class="badge badge-warning navbar-badge" id="NumNoti">{{auth()->user()->unreadNotifications->count()}}</span>
    </a>
    <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right" style="left: inherit; right: 0px;">
        <span class="dropdown-item dropdown-header text-center">News Unread registers</span>
        <div class="dropdown-divider"></div>
        @if(auth()->user()->is_admin)
            @forelse($notifications as $notification)
            <a href="#" class="dropdown-item">
                <i class="fas fa-envelope mr-2"></i> {{ $notification->data['name'].' '. $notification->data['message'] }}
            </a>
        @empty
        <div class="card bg-light text-white p-2 text-center">
            There are no new notifications
        </div>
        @endforelse
        @endif
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
        
    </div>
</li>
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