<?php

namespace App\Http\Controllers;
use App\Notifications\newsCreated;
use App\events\RealTimeMessage;
//use App\Notifications\DataBase;
use App\Models\User;
//use App\Models\Notification;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    public function email()
    {
        $email= Notification::send(User::where('email','erasto.mendoza.perez@gmail.com')-> first(), new newsCreated);
        //dd($email);
        return view('notifications.email')->with('email',$email);
    }
    public function NotiUpdate($id)
    {
        if($id){
            auth()->user()->unreadNotifications->where('id',$id)->markAsRead();
        }else{
            auth()->user()->unreadNotifications->markAsRead();
        }
        return redirect()->route('index');
    }
    public function broadcasting()
    {
        event(new RealTimeMessage('Hello World! I am an event 😄'));
    }
    /*public function db()
    {
        $db= Notification::send(User::where('email','erasto.mendoza.perez@gmail.com')-> first(), new DataBase);
        //dd($email);
        return view('notifications.DataBase')->with('email',$db);
    }*/
}
