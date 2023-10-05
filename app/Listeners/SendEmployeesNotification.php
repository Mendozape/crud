<?php

namespace App\Listeners;

use App\Events\EmployeesUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Notifications\EmployeesUpdatedNotification;
use Illuminate\Support\Facades\Notification;
use App\Models\User;
use App\Models\employees;

class SendEmployeesNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(EmployeesUpdated $event): void
    {
        $admins = User::where('email','erasto.mendoza.perez@gmail.com')-> first();
        Notification::send($admins, new EmployeesUpdatedNotification($event->employee));
    }
}
