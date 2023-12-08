@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@include('top')
@section('content')
<section class="section">
    <div class="section-header" align="center">
        <h1>Notifications</h1>
    </div>
    <div class="section-body mt-2" >
        <div class="row">
            <div class="col-lg-12"> 
                <div class="card">
                    <div class="card-body" id="notis">
                        @if(auth()->user()->is_admin)
                        @forelse($data['notifications'] as $notification)
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
                                        <h5>Usuariox</h5>
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

