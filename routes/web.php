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
    Route::put('/user/profile-information', [ProfileController::class, 'updateProfileInformation'])
        ->name('user.profile.update');
    Route::put('/user/password', [ProfileController::class, 'updatePassword'])
        ->name('user.password.update');
    Route::get('/{any}', [SpaController::class, 'index'])
        ->where('any', '.*');
});
