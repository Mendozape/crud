<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $notifications = auth()->user()->unreadNotifications;
        $admin = (Auth()->user()->isAdmin) ? 'Yes' : 'No';
        $data = [
            'notifications'  => $notifications,
            'admin'  => $admin
        ];
        return view('home')->with('data',$data);
    }
}
