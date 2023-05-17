@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section" align="center">
    <div class="section-header">
        <h3 class="page_heading">Dashboard</h3>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 col-xl-4">
                                <div class="card bg-c-blue order-card">
                                    <div class="card-blok">
                                        <h5>Usuarios</h5>
                                        <h2 class="text-right"><i class="fa fa-users f-left"></i><span></span></h2>
                                        <p class="m-b-0 text-right"> <a href="/usuarios" class="text-black">Ver más</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop