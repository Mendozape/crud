@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section">
    <div class="section-header">
        <h3 class="page_heading">Editar usuarios</h3>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        @if($errors->any())
                        <div class="alert alert-dark alert-dismissible fade show" role="alert">
                            <strong>¡Revise los campos!</strong>
                            @foreach($errors->all() as $error)
                            <span class="badge badge-danger">{{$error}}</span>
                            @endforeach
                            <button type="button" class="close" data-dismiss="alert" aria-label="close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        @endif
                        {!! Form::model($user,['method'=>'PUT','route'=>['usuarios.update',$user->id]]) !!}
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="name">Nombre</label>
                                {!! Form::text('name', null, array('class'=>'form-control')) !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="name">E-mail</label>
                                {!! Form::text('email', null, array('class'=>'form-control')) !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="password">Password</label>
                                {!! Form::password('password',array('class'=>'form-control')) !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="confirm-password">Confirmar password</label>
                                {!! Form::password('confirm-password',array('class'=>'form-control')) !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="">Roles</label>
                                {!! Form::select('roles[]',['0' => 'Select your role'] + $roles,[],array('class'=>'form-control')) !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <button type="submit" class="btn btn-primary">Guardar</button>
                        </div>
                        {!! Form::close() !!}
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop