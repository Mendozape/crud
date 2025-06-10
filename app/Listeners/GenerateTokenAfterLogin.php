<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Models\User; 


class GenerateTokenAfterLogin
{
    public function handle(Login $event): void
    {
        //$user = $event->user;
        // Revoca tokens anteriores (opcional)
        //$user->tokens()->delete();
        // Crea un nuevo token
        //$token = $user->createToken('auth_token')->plainTextToken;
        // Guarda el token en la sesión
        //session(['api_token' => $token]);
    }
}
