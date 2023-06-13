@extends('adminlte::page')
@section('Select', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section">
    <div class="section-header">
        <h3 class="page_heading">Users info</h3>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                   <form method="POST" enctype="multipart/form-data">
                    @csrf
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="name">Role</label>
                                {!! Form::select('roles', [null => 'Select role'] + $roles,null, array('class'=>'form-control', 'id' => 'roles', 'onchange' => 'permisos()')) !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12" id="permisos"></div>
                        <div class="col-xs-12 col-sm-12 col-md-12" id="modules"></div>
                        <!--<div class="col-xs-12 col-sm-12 col-md-12" id="modules"></div>
                        <div class="col-xs-12 col-sm-12 col-md-12"> 
                            <button type="submit" class="btn btn-primary">Guardar</button>
                        </div>-->
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop
@section('js')
<script src="{{asset('js/app.js')}}"></script>
<script>
    /*$(document).ready(function() {
        $("#roles").on("change", function() {
            
        });
        $("#permissions").on("change", function() {
            alert('sdfsf');
            
        });
    });*/
    function permisos(){
        var role = $('#roles').val();
            var url ='{{ route("select.edit",":role") }}';
            url = url.replace(':role', role);
            $.ajax({
                url:url,
                type: 'GET',
                dataType: 'json',
                data: {role: role,"_token":"{{ csrf_token() }}"},
                success: function(datos) {
                    var html = '<div class=" form-group">';
                    html += '<label for="name">Permissions</label>';
                    html += '<select name="permissions" id="permissions" class="form-control" onchange= "modulos()">';
                    html += '<option value="">Select permission</option>';
                    for (var e in datos.permissions) {
                        html += '<option value="' + datos.permissions[e] + '">' + datos.permissions[e] + '</option>';
                    }
                    html +='</select></div>';
                    $('#permisos').html(html);
                }
            });
    }
    function modulos(){
            var permiso = $('#permissions').val();
            var url ='{{ route("select.create") }}';
            //url = url.replace(':permiso', permiso);
            $.ajax({
                url:url,
                type: 'GET',
                dataType: 'json',
                data: {permiso: permiso,"_token":"{{ csrf_token() }}"},
                success: function(datos) {
                    var html = ' <div class=" form-group">';
                    html += '<label for="name">Modules</label>';
                    html += '<select name="modules" id="modules" class="form-control">';
                    html += '<option value="' + datos.permiso + '">"' + datos.permiso + '"</option>';
                    html +='</select></div>';
                    $('#modules').html(html);
                }
            });  
    }
</script>
@stop