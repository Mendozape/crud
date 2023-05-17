@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section">
    <div class="section-header">
        <h3 class="page_heading">Editar roles</h3>
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
                        {!! Form::model($role,['method'=>'PUT','route'=>['roles.update',$role->id]]) !!}
                        @csrf
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="name">Nombre del rol</label>
                                {!! Form::text('name', null, array('class'=>'form-control')) !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class="form-group">
                                <label for="">Permisos para este rol:</label>
                                <br/>
                                @foreach($permission as $value)
                                <label for="">{{ Form::checkbox('permission[]',$value->id,in_array($value->id,$rolePermission)) }} {{ $value->name }}</label>
                                <br />
                                @endforeach
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                        {!! Form::close() !!}
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop