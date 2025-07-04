<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Auth\Events\Logout;
use App\Listeners\ClearLastLoginToken;
use App\Events\EmployeesUpdated;
use App\Listeners\SendEmployeesNotification;
use App\Listeners\SendNewUserNotification;
//use App\Listeners\GenerateTokenAfterLogin;
//use Illuminate\Auth\Events\Login;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
            SendNewUserNotification::class,
        ],
        EmployeesUpdated::class => [
            SendEmployeesNotification::class,
        ],
        Logout::class => [
            ClearLastLoginToken::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot()
    {
        //
    }
}
