<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\Request;

/*class CustomLoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $token = session('api_token'); // Pick up the token saved by the listener

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $request->user(),
        ]);
    }
}*/