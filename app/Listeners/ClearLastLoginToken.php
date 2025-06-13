<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;

class ClearLastLoginToken
{
    public function handle(Logout $event): void
    {
        $user = $event->user;

        if ($user) {
            $user->last_login_token = null;
            $user->save();
        }
        //session()->forget('last_login_token');
    }
}