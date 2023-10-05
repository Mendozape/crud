@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content_header')
<!-- CSRF Token -->
  <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
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
        <span class="dropdown-item dropdown-header"> Unread Notifications</span>
        <div class="dropdown-divider"></div>
        @if(auth()->user()->is_admin)
            @forelse($notifications as $notification)
            <a href="#" class="dropdown-item">
                <i class="fas fa-envelope mr-2"></i> {{ $notification->created_at }}
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
    <div class="section-header" align="center">
        <h1>Notifications</h1>
    </div>
    <div class="section-body mt-2">
        <div class="row">
            <div class="col-lg-12"> 
                <div class="card">
                    <div class="card-body">

                        @if(auth()->user()->is_admin)
                        @forelse($notifications as $notification)
                        <div class="card bg-light text-white p-2 text-center">
                            [{{ $notification->created_at }}] User {{ $notification->data['name'] }} has just registered.
                            <a href="{{ route('NotiUpdate',$notification->id)}}" class="float-right mark-as-read" data-id="{{ $notification->id }}">
                                Mark as read
                            </a>
                        </div>
                        @if($loop->last)
                        <div class="card bg-light text-white p-2 text-center">
                            <a href="{{ route('NotiUpdate','0')}}" data-id="{{ $notification->id }}">
                                Mark all as read
                            </a>
                        </div>
                        @endif
                        @empty
                        <div class="card bg-light text-white p-2 text-center">
                        There are no new notifications
                        </div>
                        @endforelse
                        @endif

                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="section" align="center">
    <div class="section-header" align="center">
        <h1>Dashboard</h1>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 col-xl-4">
                                <div class="card bg-success text-white p-2">
                                    <div class="card-subtitle">
                                        <h5>Usuario</h5>
                                        <h2 class="text-left"><i class="fa fa-users fa-1x "></i><span style="float:right">{{ App\Models\User::count(); }}</span></h2>
                                        <p class="m-b-0 text-right"> <a href="/client" class="text-white">Ver más</a></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 col-xl-4">
                                <div class="card bg-secondary text-white p-2">
                                    <div class="card-subtitle ">
                                        <h5>Personal</h5>
                                        <h2 class="text-left"><i class="fa fa-user "></i><span style="float:right">{{ App\Models\Client::count(); }}</span></h2>
                                        <p class="m-b-0 text-right"> <a href="/client" class="text-white">Ver más</a></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 col-xl-4">
                                <div class="card bg-info text-white p-2">
                                    <div class="card-subtitle">
                                        <h5>Roles</h5>
                                        <h2 class="text-left"><i class="fa fa-user-lock "></i><span style="float:right">{{ Spatie\Permission\Models\Role::count(); }}</span></h2>
                                        <p class="m-b-0 text-right"> <a href="/roles" class="text-white">Ver más</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop
@section('footer')
<p>Copyright © 2023 mendodevelopments All rights reserved. Version 1.0</p>
@stop
