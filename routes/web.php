<?php
use App\Http\Controllers\ClientController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\SelectController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\HomeController;

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
    //Route::get('/home', function () { return view('/index'); });
    Route::get('/home',[HomeController::class, 'index'])->name('index');
    Route::get('/livewire',function () { return view('/livewire/home'); });
    //Route::get('/crudlive',function () { return view('/livewire/crud/home'); });
    Route::resource('permisos',PermisosController::class);
    Route::resource('roles',RolesController::class);
    Route::resource('client',ClientController::class);
    Route::resource('usuarios',UsuariosController::class);
    Route::resource('select',SelectController::class);
    Route::get('/pdfUserList',[UsuariosController::class, 'pdfUserListado'])->name('pdfList');
    Route::get('/invoice',[UsuariosController::class, 'invoice'])->name('invoice');
    Route::get('/excel/importFile',[UserController::class,'importView'])->name('import-view');
    Route::post('/import',[UserController::class,'import'])->name('import');
    Route::get('/export-users',[UserController::class,'exportUsers'])->name('export-users');
    //Route Hooks - Do not delete//
	Route::view('employees', 'livewire.employees.index')->middleware('auth');
	Route::view('clients', 'livewire.clients.index')->middleware('auth');
    Route::get('/notifications',[NotificationsController::class, 'email'])->name('email');
    Route::get('/NotiUpdate/{id}',[NotificationsController::class, 'NotiUpdate'])->name('NotiUpdate');
    //Route::get('/broadcasting/',[NotificationsController::class, 'broadcasting'])->name('broadcasting');
    //Route::get('/notificationsDB',[NotificationsController::class, 'db'])->name('db');
    Route::get('/test', function() {
        event(new  App\Events\StatusLiked('Guest'));
        return view('notifications.DataBase');
    });
});


