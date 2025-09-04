<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\SelectController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\FeeController;
use Illuminate\Support\Facades\Route;

// Login route
Route::get('/', function () {
    return view('auth.login');
});

// Protected routes
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified'
])->group(function () {

    // Dashboard SPA (React) - all routes handled by React Router
    Route::get('/dashboard', function () {
        return view('app'); // app.blade.php where your React container lives
    })->name('dashboard');

    // API / resource routes (Laravel controllers)
    Route::resource('permisos', PermisosController::class);
    Route::resource('roles', RolesController::class);
    Route::resource('client', ClientController::class);
    Route::resource('usuarios', UsuariosController::class);
    Route::resource('select', SelectController::class);

    Route::get('/pdfUserList', [UsuariosController::class, 'pdfUserListado'])->name('pdfList');
    Route::get('/invoice', [UsuariosController::class, 'invoice'])->name('invoice');

    Route::get('/excel/importFile', [UserController::class,'importView'])->name('import-view');
    Route::post('/import', [UserController::class,'import'])->name('import');
    Route::get('/export-users', [UserController::class,'exportUsers'])->name('export-users');

    // Notifications
    Route::get('/notifications', [NotificationsController::class, 'email'])->name('email');
    Route::get('/NotiUpdate/{id}', [NotificationsController::class, 'NotiUpdate'])->name('NotiUpdate');
    Route::get('/api', [NotificationsController::class, 'api'])->name('api');

    // Residents / Fees handled by React SPA
    //Route::get('/resident', [ResidentController::class, 'redire'])->name('redire');
    Route::get('/fees', [FeeController::class, 'redire2'])->name('redire2');

    // SPA catch-all route for React Router
    // Must be the last route in the group
    Route::get('{any}', function () {
        return view('app'); // app.blade.php with React root
    })->where('any', '.*');
});
