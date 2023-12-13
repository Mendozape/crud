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
                                    <div class="col-sm-7 col-md-6 well" id="search-bar3">
                                        <div class="col-sm-7 col-md-6">
                                            Type item number
                                        </div>
                                        <div class="col-sm-7 col-md-6 input-group well">
                                            <input type="text" class="form-control" id="field" name="field">
                                            <span class="px-1"></span>
                                            <button data-submit-form="busca" class="btn btn-info" id="btn-searchApi">Buscar</button>
                                        </div>
                                    </div>
                                </div>
                           
                        </form>
                    </div>
                    <div class="text-center">
                        <div id="resultSearch"></div>
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/js/toastr.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css">
<script>
    //$(document).ready(function() {
    //toastr.info('Are you the 6 fingered man?');
    $('#search-bar1').on('click', '#btn-searchApi', function() {
        //toastr.success('Click Button');
        //let element = document.getElementById("resultSearch");
        //element.removeAttribute("hidden");

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
                    required: 'This field is required.'
                }
            },
            invalidHandler: function(event, validator) {
                toastr.error('This field is required');
            },
            success: function(label) {
                document.getElementById("resultSearch").className = "spinner-border";
                $('#resultSearch').show();
                $('#search-bar1').hide();
                toastr.info('Searching...');
            },
            submitHandler: function() {
                var html = '';
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
                            let element = document.getElementById("resultSearch");
                            element.classList.remove('spinner-border');
                            html += `
                                <div class="p-3 row">`;
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
                                </div>`;
                            $('#resultSearch').html(html);
                        })
                    .catch(error => {
                        let element = document.getElementById("resultSearch");
                        element.classList.remove('spinner-border');
                        html = '<div>Something went wrongxx</div>';
                        html += `</div>`;
                        $('#resultSearch').html(html);
                    });
                return false;
            }
        });
    });
    //});
</script>
@stop