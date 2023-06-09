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
                                <!--<select name="roles" id="roles" class="form-control" onchange="showSelectedValue()"></select>-->
                                <select id='roles' >
                                    <option value="1">Admin</option>
                                    <option value="2">Prog</option>
                                </select>

                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <div class=" form-group">
                                <label for="name">Permissions</label>
                                <select name="select" name="permissions" id="permissions" class="form-control"></select>
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12">
                            <button type="submit" class="btn btn-primary">Guardar</button>
                        </div>
                   
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
        $('#users').on('change',function(){
            var user=$(this).val();
            alert('sdfsf');
        });
    });*/

    //function showSelectedValue() {
    $('#roles').change(function(){ 
        var role = $('#roles').val();
       //alert(role);
        $.ajax({  
            url: '/select/create',
             
            type: 'GET',
            dataType: 'json',
            data: {role: role,"_token":"{{ csrf_token() }}"},
            success: function(data) {
                alert(data);
                //var html = '<option value="">Select permission</option>';
                //$('#permissions').html(html);
            }
        });
    });
</script>
@stop