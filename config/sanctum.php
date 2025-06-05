<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | These are the domains that should receive stateful authentication cookies.
    | For local development, make sure to include both frontend and backend.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', implode(',', [
        'localhost',
        'localhost:8000',
        '127.0.0.1',
        '127.0.0.1:8000',
        '::1',
    ]))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | These guards will be used to authenticate requests. The "web" guard is
    | required when using Sanctum with Laravel session authentication.
    |
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | Set to null to disable expiration on personal access tokens. This setting
    | does not affect cookie-based authentication used in SPAs.
    |
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | These middleware will be applied to Sanctum's route group. Make sure
    | CSRF and cookie encryption are included for session-based auth.
    |
    */

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],

];