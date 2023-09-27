<?php

namespace App\Http\Controllers;
use App\Notifications\newsCreated;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    public function email()
    {
        $email= Notification::send(User::where('id',4)-> first(), new newsCreated);
        //dd($email);
        return view('notifications.email')->with('email',$email);
    }
}
