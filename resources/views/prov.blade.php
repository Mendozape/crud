@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@include('top')
@section('content')
<section class="section">
    <div class="section-header" align="center">
        <h1>Notifications no jsx</h1>
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
@stop
@section('js')
	@viteReactRefresh
	@vite('resources/js/app.js')
@stop