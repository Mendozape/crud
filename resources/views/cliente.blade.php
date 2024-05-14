@extends('adminlte::page')
@section('title', 'Increment')
@section('content_header')
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Laravel 10 - REACT 18 INCREMENT</title>
@stop
@section('content_top_nav_right')
	<div id="TopNavDiv"></div>
@stop
@section('content')
	<div id="yyy"></div>
@stop
@section('js')
	@viteReactRefresh
	@vite('resources/js/app.js')
@stop
