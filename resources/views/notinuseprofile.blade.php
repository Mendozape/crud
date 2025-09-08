@extends('adminlte::page') <!-- use AdminLTE layout -->

@section('title', 'Profile') <!-- optional -->

@section('content_header')
    <h1>My Profile</h1>
@stop

@section('content')
    <p>Name: {{ Auth::user()->name }}</p>
    <p>Email: {{ Auth::user()->email }}</p>
    <!-- Optional: React mount point -->
    <div id="profile-react"></div>
@stop
