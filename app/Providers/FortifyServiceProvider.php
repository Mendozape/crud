<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Contracts\LoginResponse;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // You can bind custom login response logic here if needed
        // $this->app->singleton(LoginResponse::class, CustomLoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fortify action bindings
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        // Rate limiters for login and 2FA
        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->email;
            return Limit::perMinute(5)->by($email . $request->ip());
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        //This is for log in only in one device
        /*Fortify::authenticateUsing(function (Request $request) {
            $user = \App\Models\User::where('email', $request->email)->first();
            if ($user && Hash::check($request->password, $user->password)) {
                $sessionToken = Session::get('last_login_token');
                // Check if the user has a login token from a previous session
                if ($user->last_login_token && $user->last_login_token !== $sessionToken) {
                    // Check if the last activity is older than session expiration
                    $lastActivity = $user->updated_at;
                    $expirationMinutes = config('session.lifetime');
                    if ($lastActivity->diffInMinutes(now()) >= $expirationMinutes) {
                        // Token is expired, clear it so user can log in again
                        $user->last_login_token = null;
                        $user->save();
                    } else {
                        // Token still valid -> block login from other device
                        throw ValidationException::withMessages([
                            Fortify::username() => ['This account is already logged in on another device.'],
                        ]);
                    }
                }
                // Generate a new session token and save it
                $newToken = Str::uuid()->toString();
                $user->last_login_token = $newToken;
                // Update updated_at timestamp (important for tracking activity)
                $user->touch(); // equivalent to $user->updated_at = now(); $user->save();
                $user->save();
                Session::put('last_login_token', $newToken);
                return $user;
            }
            return null; // Invalid credentials
        });*/
        Fortify::authenticateUsing(function (Request $request) {
            $user = \App\Models\User::where('email', $request->email)->first();
            if ($user && Hash::check($request->password, $user->password)) {
                // No token checks, allow multiple logins
        
                return $user;
            }
        
            return null;
        });
    }
}
