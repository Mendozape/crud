<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;

class CreateApiTokenAfterLogin
{
    /**
     * Handle the login event.
     */
    public function handle(Login $event): void
    {
        // Create a new Sanctum token for the authenticated user
        $token = $event->user->createToken('web-login')->plainTextToken;

        // Store the token in the session for later use
        session(['api_token' => $token]);

        // Log the token generation for debugging purposes
        logger()->info('Token generated for user ID: '.$event->user->id.' Token: '.$token);
    }
}