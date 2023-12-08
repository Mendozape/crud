@extends('adminlte::page')
@section('Api Rest', 'MY LARAVEL SYSTEM')
@include('top')
@section('content_header')


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
                        <form id="busca">
                            <div class="row" id="search-bar1">
                                <div class="col-sm-7 col-md-6" id="search-bar2">
                                    <div class="col-sm-7 col-md-6 input-group well" id="search-bar3">
                                        <input type="text" class="form-control" id="field" name="field">
                                        <span class="input-group-btn px-2" id="search-bar5">
                                            <button data-submit-form="busca" class="btn btn-info" id="btn-searchApi">Buscar</button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="row" style="align-content:center;">
                        <div class="col-xs-12 col-sm-12 col-md-12" style="width:90%; height: 950px;  margin-left:5%;" id="resultSearch"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop
@section('js')
<script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/jquery.validation/1.16.0/jquery.validate.min.js"></script>

<script>
    $('#search-bar1').on('click', '#btn-searchApi', function() {

        //$(document).ready(function() {

        //$('#resultSearch').html('sdfsfdsf');
        /*$("#busca").validate({
            errorElement: 'em',
            errorClass: 'help-block help-block-error',
            focusInvalid: true,
            ignore: ':hidden',
            rules: {
                searchx: {
                    required: true
                }
            }
        });*/
        $("#busca").validate({
            errorElement: 'em',
            errorClass: 'help-block help-block-error',
            focusInvalid: true,
            ignore: ':hidden',
            success: "valid",
            rules: {
                field: {
                    required: true,
                    minlength: 1
                }

            },
            messages: {
                field: {
                    required: 'Este campo es obligatorio'
                }
            },
            success: function(label) {
                $('#resultSearch').show();
                $('#search-bar1').hide();
            },
            submitHandler: function() {
                var html = '';
                //const data={name:'lato'};
                let id = $('#field').val();
                let status;
                //fetch(`http://crud.mendodevelopments.com/api/articles`,{
                fetch(`http://crud.mendodevelopments.com/api/articles/${id}`, {
                        method: 'GET',
                        mode: 'cors',
                        headers: new Headers({
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': '*',
                            'Access-Control-Allow-Credentials': false,
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
                            html += `
                    <section class="section" align="center">
                    <div class="section-body">
                    <div class="row">
                    <div class="col-lg-9">
                    <div class="card">
                    <div class="card-body">
                    <div class="row">`;
                            const iterable = ((x) => ( //to know if object is iterable
                                (Reflect.has(x, Symbol.iterator)) &&
                                (typeof(x[Symbol.iterator]) === "function")
                            ));
                            if (iterable(data) && status === 200) {
                                data.forEach(element => {
                                    html += `
                            <div class="col-md-4 col-xl-4">
                                <div class="card bg-secondary text-white p-2">
                                    <div class="card-subtitle">
                                        <h5>` + element.article + `</h5>
                                        <h2 class="text-left"><i class="fa fa-users fa-1x "></i><span style="float:right">` + element.description + `</span></h2>
                                        <p class="m-b-0 text-right"> <a href="" class="text-white">Ver más</a></p>
                                    </div>
                                </div>
                            </div>`;
                                });
                            } else if (status === 200) {
                                html += `
                        <div class="col-md-4 col-xl-4">
                            <div class="card bg-secondary text-white p-2">
                                <div class="card-subtitle">
                                    <h5>` + data.article + `</h5>
                                    <h2 class="text-left"><i class="fa fa-users fa-1x "></i><span style="float:right">` + data.description + `</span></h2>
                                    <p class="m-b-0 text-right"> <a href="" class="text-white">Ver más</a></p>
                                </div>
                            </div>
                        </div>`;
                            } else {
                                html = '<div>Item not found</div>';
                            }
                            html += `
                    </div>
                    </div>
                    </div>
                    </div>
                    </div>
                    </div>
                    </section>`;
                            $('#resultSearch').html(html);
                        })
                    .catch(error => {
                        html = '<div>Something went wrongxx</div>';
                        html += `
                    </div>
                    </div>
                    </div>
                     </div>
                    </div>
                    </div>
                    </section>`;
                        $('#resultSearch').html(html);
                    });
                return false;
            }
        });
        
        //});


    });
</script>
@stop