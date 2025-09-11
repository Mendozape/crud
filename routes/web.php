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
use App\Http\Controllers\SpaController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// -------------------------
// Public routes
// -------------------------
Route::get('/', function () {
    return view('auth.login');
});

// -------------------------
// Protected routes (auth)
// -------------------------
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified'
])->group(function () {

    

    // -------------------------
    // Profile management
    // -------------------------
    Route::put('/user/profile-information', [ProfileController::class, 'updateProfileInformation'])
        ->name('user.profile.update');

    Route::put('/user/password', [ProfileController::class, 'updatePassword'])
        ->name('user.password.update');

    // -------------------------
    // API resource routes
    // -------------------------
    
    
    Route::resource('client', ClientController::class);
    //Route::resource('usuarios', UsuariosController::class);
    Route::resource('select', SelectController::class);

    // -------------------------
    // File export / import
    // -------------------------
    Route::get('/pdfUserList', [UsuariosController::class, 'pdfUserListado'])->name('pdfList');
    Route::get('/excel/importFile', [UserController::class,'importView'])->name('import-view');
    Route::post('/import', [UserController::class,'import'])->name('import');
    Route::get('/export-users', [UserController::class,'exportUsers'])->name('export-users');

    // -------------------------
    // Notifications
    // -------------------------
    Route::get('/notifications', [NotificationsController::class, 'email'])->name('email');
    Route::get('/NotiUpdate/{id}', [NotificationsController::class, 'NotiUpdate'])->name('NotiUpdate');
    Route::get('/api', [NotificationsController::class, 'api'])->name('api');

    // -------------------------
    // SPA catch-all (React Router)
    // Must be the LAST route
    // -------------------------
    Route::get('/{any}', [SpaController::class, 'index'])
        ->where('any', '.*');
});
