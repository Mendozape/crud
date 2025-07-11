<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\User;
use App\Notifications\UserRegisteredNotification; // Use the new notification class
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
     *
     * @param  object  $event
     * @return void
     */
    public function handle(object $event): void
    {
        // Get all users with the role 'Admin' using Spatie package
        $admins = User::role('Admin')->get();

        // Send the notification to all admins
        Notification::send($admins, new UserRegisteredNotification($event->user));
    }
}