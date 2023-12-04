@extends('adminlte::page')
@section('Api Rest', 'MY LARAVEL SYSTEM')
@include('top')
@section('content_header')
<script src="http://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js"></script>
@stop

@section('content')
<section class="section">
    <div id="demo"></div>
    <div class="section-header" align="center">
        <h1>API REST</h1>
    </div>
    <div class="section-body mt-2">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <form class="d-inline form-search" id="busca">
                            <div class="mb-1" id="search-bar1">
                                <label for="name" class="form-label mb-1">Type the article</label>
                                <input type="text" name="searchx" id="searchx" class="form-control" placeholder="Article">
                                <button data-submit-form="busca" class="btn btn-info mt-2" id="btn-searchApi">Buscar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop
@section('js')

<script>
    $('#search-bar1').on('click', '#btn-searchApi', function() {
        searchArticle($(this));
    });

    let searchArticle = function(e) {
        //alert($('#searchx').val());
        let $form = $('#busca');
        let validator = $form.validate({
            errorElement: 'em',
            errorClass: 'help-block help-block-error',
            focusInvalid: true,
            ignore: ':hidden',
            rules: {
                searchx: {
                    required: true,
                    minlength: 1
                }

            },
            messages: {
                searchx: {
                    required: 'Este campo es obligatorio'
                }
            },
            /*invalidHandler: function(event, validator) {
                var campo = $(validator.errorList[0].element);
                toastr.warning(campo.prev('label').html());
                App.scrollTo(campo, -200);
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
            },*/
            submitHandler: function() {
                /*fetch('http://crud.mendodevelopments.com/api/articles')
                .then(response => response.json())
                .then(json => console.log(json))
                .catch(err => console.log('Solicitud fallida', err));*/

                /*async function SearchEmployee() {
                        const response = await fetch('http://crud.mendodevelopments.com/api/users');
                        const json = await response.json();
                        const reposList = json.map(emplo => emplo.name);
                        console.log(json);*/

                //let base64 = require('base-64');
                /*let url = 'http://crud.mendodevelopments.com/api/users/user/passwd';
                let username = 'admin@gmail.com';
                let password = '12345678';
                let headers = new Headers();
                headers.append('Content-Type', 'text/json');
                headers.append('Authorization':'Basic ' + base64.encode(username + ":" + password));*/
                var html='';
                const data={name:'lato'};
                let id=$('#searchx').val();
                let status;
                //let mat =  e.parent().parent().attr('id');
                //let mat =  e.parent().parent().val();
                //fetch(`http://crud.mendodevelopments.com/api/articles`,{
                fetch(`http://crud.mendodevelopments.com/api/articles/${id}`,{
                    method: 'GET',
                    mode:'no-cors',
                    headers: new Headers({
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Credentials':false,
                        //'Host': 'http://crud.mendodevelopments.com',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Methods': '*',
                        'Content-Type': '*',
                        //'Content-Type': 'application/x-www-form-urlencoded',
                        //'Authorization': 'Basic '+btoa('admin@gmail.com:12345678'),
                        'Authorization': 'Bearer 1|laravel_sanctum_SkvTwvcaMecWpvAgZ48HoIkSgBX8XANqc2sUJIgma14768e8',
                        //'Authorization': 'Basic '+ base64.encode('admin@gmail.com:12345678')
                    }),
                })
                .then(function(response) {
                    status = response.status;
                    return response.json();
                })
                .then(
                    function(data) {
                    html+=`<div class="align-content-center">`;
                    const iterable = ((x) => (//to know if object is iterable
                        (Reflect.has(x, Symbol.iterator)) &&
                        (typeof (x[Symbol.iterator]) === "function")
                    ));
                    if(iterable(data) && status===200){
                        data.forEach(element => {
                            html+=`<div class="col-xs-12 col-sm-12 col-md-5 col-lg-5 alert alert-info" id="buscar" type="hidden" style="height:250px; ">
                                    <div>
                                        <div class="portlet box blue" style="margin-top:4%;">
                                            <div class="portlet-title">
                                                <div class="caption" style="width:85%;font-size:medium;">
                                                    <i class="fa fa-key "></i>
                                                    <strong>`+element.article+`</strong>
                                                    <br><i class="fa fa-user "></i>`
                                                    +element.description+
                                                `</div>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            <div class="col-xs-0 col-sm-0 col-md-1 col-lg-0"></div>`;
                        });
                    }else if(status===200){
                            html+=`<div class="col-xs-12 col-sm-12 col-md-5 col-lg-5 alert alert-info" id="buscar" type="hidden" style="height:250px; ">
                                    <div>
                                        <div class="portlet box blue" style="margin-top:4%;">
                                            <div class="portlet-title">
                                                <div class="caption" style="width:85%;font-size:medium;">
                                                    <i class="fa fa-key "></i>
                                                    <strong>`+data.article+`</strong>
                                                    <br><i class="fa fa-user "></i>`
                                                    +data.description+
                                                `</div>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            <div class="col-xs-0 col-sm-0 col-md-1 col-lg-0"></div>`;
                    }else{
                        html='<div>Item not found</div>';
                    }
                    html+=`</div>`;
                    $('#resultSearch').html(html);
                })
                .catch(error => {
                    html='<div>Something went wrongxx</div>';
                    html+=`</div>`;
                    $('#resultSearch').html(html);
                });
                return false;
            }
        });
    }
</script>
@stop
@section('js')

@endsection