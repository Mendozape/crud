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
                                    <div class="input-group well" id="search-bar3">
                                        <input type="text" class="form-control" id="field" name="field">
                                        <span class="input-group-btn" id="search-bar5">
                                            <button data-submit-form="busca" class="btn blue uppercase bold" id="btn-searchApi">Buscar</button>
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
        //$('#search-bar1').hide();
        //$('#resultSearch').show();
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
        });

        //});
    });
</script>
@stop