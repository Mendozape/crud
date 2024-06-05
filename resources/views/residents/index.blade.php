@extends('adminlte::page')
@section('plugins.Sweetalert2', true)
@section('title', 'MY LARAVEL SYSTEM')
@include('top')
@section('content')
<div id="Residentes"></div>
@stop
@section('css')
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
@stop
@section('js')
@vite(['resources/js/app.js'])
@stop