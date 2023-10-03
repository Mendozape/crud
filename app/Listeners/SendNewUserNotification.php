<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\User;
use App\Notifications\DataBase;
use Illuminate\Support\Facades\Notification;
class SendNewUserNotification
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
    public function handle(object $event): void
    {
        /*$admins = User::whereHas('roles', function ($query) {
            $query->where('id', 1);
        })->get();*/
        $admins = User::where('email','erasto.mendoza.perez@gmail.com')-> first();
        Notification::send($admins, new DataBase($event->user));
    }
}
