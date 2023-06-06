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
                                <div class="card bg-c-blue order-card" >
                                    <div class="card-block">
                                        <h5>Usuarios</h5>
                                        <h2 class="text-right"><i class="fa fa-users f-left"></i><span>{{ App\Models\User::count(); }}</span></h2>
                                        <p class="m-b-0 text-right"> <a href="/usuarios" class="text-white">Ver más</a></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 col-xl-4">
                                <div class="card bg-c-green order-card">
                                    <div class="card-block">
                                        <h5>Personal</h5>
                                        <h2 class="text-right"><i class="fa fa-user f-left"></i><span>{{ App\Models\Client::count(); }}</span></h2>
                                        <p class="m-b-0 text-right"> <a href="/client" class="text-white">Ver más</a></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 col-xl-4">
                                <div class="card bg-c-pink order-card">
                                    <div class="card-block">
                                        <h5>Roles</h5>
                                        <h2 class="text-right"><i class="fa fa-user-lock f-left"></i><span>{{ Spatie\Permission\Models\Role::count(); }}</span></h2>
                                        <p class="m-b-0 text-right"> <a href="/roles" class="text-white">Ver más</a></p>
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
@section('css')
<link href="{{asset('css/app.css')}}" rel="stylesheet">
@stop