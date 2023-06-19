<?php
use App\Http\Controllers\ClientController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\SelectController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('auth.login');
});
Route::get('/home', function () {
    return view('/home');
});

//Route::get('/client/welcome',[ClientController::class, 'welcome']);
Route::get('/usuarios/index',[UsuariosController::class, 'index']);

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified'
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});
Route::middleware(['auth'])->group(function(){
    Route::resource('permisos',PermisosController::class);
    Route::resource('roles',RolesController::class);
    Route::resource('client',ClientController::class);
    Route::resource('usuarios',UsuariosController::class);
    Route::resource('select',SelectController::class);
    Route::get('/pdfUserList',[UsuariosController::class, 'pdfUserListado'])->name('pdfList');
    Route::get('/invoice',[UsuariosController::class, 'invoice'])->name('invoice');
    //Route::get('/excel',[UsuariosController::class, 'excelUsers'])->name('excel');
    Route::get('/excel/importFile',[UserController::class,'importView'])->name('import-view');
    Route::post('/import',[UserController::class,'import'])->name('import');
    Route::get('/export-users',[UserController::class,'exportUsers'])->name('export-users');

});


