@extends('adminlte::page')
@section('plugins.Sweetalert2', true)
@section('title', 'MY LARAVEL SYSTEM')
@section('content')
<section class="section">
  <div class="section-header" align="center" >
    <h1>Email</h1>
  </div>
  <div class="section-body mt-2">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <table class="table" id="clientes">
              <tbody>
                <tr>
                    <td class="text-center">The email was sent successfully</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
@stop
@section('js')
@vite(['resources/js/app.js'])
</script>
@stop