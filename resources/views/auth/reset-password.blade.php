@extends('adminlte::auth.auth-page', ['auth_type' => 'password/reset'])

@section('adminlte_css_pre')
    {{-- Incluye tus estilos de fondo aquí para que también apliquen al Reset Password --}}
    <link rel="stylesheet" href="{{ asset('css/login-custom.css') }}">
    <link rel="stylesheet" href="{{ asset('vendor/icheck-bootstrap/icheck-bootstrap.min.css') }}">
@stop

{{-- Definimos la URL de acción del formulario, forzando la ruta POST de Fortify/Jetstream --}}
@php( $password_update_url = route('password.update') )

@section('auth_header', __('adminlte::adminlte.password_reset_message'))

@section('auth_body')
    {{-- Manejo de Errores de Validación sin viñetas --}}
    @if ($errors->any())
        <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">{{ __('Whoops! Something went wrong.') }}</h4>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ $password_update_url }}" method="post">
        @csrf

        {{-- Token de restablecimiento (requerido por Fortify/Jetstream) --}}
        <input type="hidden" name="token" value="{{ $request->route('token') }}">

        {{-- Email field --}}
        <div class="input-group mb-3">
            <input type="email" name="email" class="form-control @error('email') is-invalid @enderror"
                   value="{{ old('email', $request->email) }}" placeholder="{{ __('adminlte::adminlte.email') }}" required autofocus>

            <div class="input-group-append">
                <div class="input-group-text">
                    <span class="fas fa-envelope {{ config('adminlte.classes_auth_icon', '') }}"></span>
                </div>
            </div>
            @error('email')
                <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
        </div>

        {{-- Password field --}}
        <div class="input-group mb-3">
            <input type="password" name="password" class="form-control @error('password') is-invalid @enderror"
                   placeholder="{{ __('adminlte::adminlte.password') }}" required autocomplete="new-password">

            <div class="input-group-append">
                <div class="input-group-text">
                    <span class="fas fa-lock {{ config('adminlte.classes_auth_icon', '') }}"></span>
                </div>
            </div>
            @error('password')
                <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
        </div>

        {{-- Password Confirmation field --}}
        <div class="input-group mb-3">
            <input type="password" name="password_confirmation" class="form-control @error('password_confirmation') is-invalid @enderror"
                   placeholder="{{ __('adminlte::adminlte.retype_password') }}" required autocomplete="new-password">

            <div class="input-group-append">
                <div class="input-group-text">
                    <span class="fas fa-lock {{ config('adminlte.classes_auth_icon', '') }}"></span>
                </div>
            </div>
            @error('password_confirmation')
                <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
        </div>

        {{-- Reset Password button --}}
        <div class="row">
            <div class="col-12">
                <button type="submit" class="btn btn-block {{ config('adminlte.classes_auth_btn', 'btn-flat btn-primary') }}">
                    <span class="fas fa-sync-alt"></span>
                    {{ __('adminlte::adminlte.reset_password') }}
                </button>
            </div>
        </div>
    </form>
@stop
