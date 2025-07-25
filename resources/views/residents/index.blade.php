
@extends('adminlte::page')
@section('title', 'Dashboard')

@section('content_header')
	<div id="header"></div>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="csrf-token" content="{{ csrf_token() }}">
	<title>Laravel 10 - REACT 18</title>
@stop
@section('content')
	<div id="Residents"></div>
@stop
@section('js')
	@viteReactRefresh
	@vite('resources/js/Components/index.jsx')
@stop