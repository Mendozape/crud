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
                        <div class="row">
                            <div class="col-md-12 col-xl-12">
                                    <div class="card-subtitle" id="search-bar1">
                                        <form id="busca" onsubmit="return validatex()">
                                            <p>
                                                <label for="field">Type the item #</label>
                                                <input type="text" size="25"  id="field" name="field">
                                            </p>
                                            <p>
                                                <!--<input class="btn btn-secondary" type="submit" value="SUBMIT">-->
                                                <input class="btn btn-secondary" type="submit" value="Search">
                                                
                                            </p>
                                        </form>
                                    </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center">
                        <div id="resultSearch"></div>
                    </div>
                    <div class="text-center">
                        <div id="error-note"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop
@section('js')
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/jquery.validation/1.16.0/jquery.validate.min.js"></script>
<script src="https://cdn.jsdelivr.net/jquery.validation/1.16.0/additional-methods.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/js/toastr.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css">
<script>
    //$(document).ready(function() {
        //toastr.info('Are you the 6 fingered man?');
    //$('#search-bar1').on('click', '#btn-searchApi', function() {
        
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
            errorClass: "error fail-alert",
            validClass: "valid success-alert",
            rules: {
                field: {
                    required: true,
                    minlength: 1
                }

            },
            messages: {
                field: {
                    required: 'This field is requiredx'
                }
            },
            /* error: function(label) {
                $(this).addClass("error");
            },*/
            errorPlacement: function(error, element) {
                    // attrib nameof the field
                    let n = element.attr("name");
                    if (n === "field") {
                        document.getElementById(n).style.color = "black";
                        element.attr("placeholder", "Please type the item number");
                        element.css('background', 'red');
                    }

                },


            success: function(label) {
                $('#resultSearch').show();
                //toastr.info('Searching...');
            },
            submitHandler: function() {
                document.getElementById("resultSearch").className = "spinner-border";
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
                            $('#search-bar1').hide();
                        })
                    .catch(error => {
                        let element = document.getElementById("resultSearch");
                        element.classList.remove('spinner-border');
                        html = '<div>Something went wrongxx</div>';
                        html += `</div>`;
                        $('#resultSearch').html(html);
                        $('#search-bar1').hide();
                    });
                return false;
             
            }
        });
    //});
    //});
</script>

@stop