@extends('adminlte::page')
@section('title', 'IMPORT & EXPORT EXCEL')
@section('content')
<section class="section" align="center">
    <div class="section-header">
        <h3 class="page_heading">Import & Export Excel</h3>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
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
                    <div class="card-body">
                        <form action="{{ route('import') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <div class="form-group mb-4">
                                <div class="custom-file text-left">
                                    <input type="file" name="file" class="custom-file-input" id="customFile">
                                    <label class="custom-file-label" for="customFile">Choose file</label>
                                </div>
                            </div>
                            <button class="btn btn-primary">Import Users</button>
                            <a class="btn btn-success" href="{{ route('export-users') }}">Export Users</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop

@section('js')
<script src="{{asset('js/app.js')}}"></script>
@if (Session::has('users_added'))
<script>
    Swal.fire(
        'Added!',
        'The  users have been added.',
        'Exito'
    )
</script>
@endif
@stop