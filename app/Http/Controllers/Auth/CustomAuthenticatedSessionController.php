<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\DB;

class CustomAuthenticatedSessionController extends AuthenticatedSessionController
{
    public function store(LoginRequest $request)
    {
        // Get the user by email
        /*$user = \App\Models\User::where('email', $request->email)->first();

        // If user exists, check if there's an active session
        if ($user) {
            $activeSession = DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('last_activity', '>=', now()->subMinutes(config('session.lifetime'))->timestamp)
                ->first();

            if ($activeSession) {
                return back()->withErrors(['email' => 'This user is already logged in on another device.']);
            }
        }

        // Continue with login
        return parent::store($request);
    }*/
}