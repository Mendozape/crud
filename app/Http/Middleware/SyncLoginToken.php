<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SyncLoginToken
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user->last_login_token) {
            // Get the last time the user was updated (used as a proxy for last activity)
            $lastActivity = $user->updated_at;

            // Session expiration time from config (in minutes)
            $expirationMinutes = config('session.lifetime');

            // Check if the user's last activity is older than the expiration time
            if ($lastActivity->diffInMinutes(now()) >= $expirationMinutes) {
                // Session is considered expired, so clear the login token
                $user->last_login_token = null;
                $user->save();
            }
        }

        return $next($request);
    }
}
