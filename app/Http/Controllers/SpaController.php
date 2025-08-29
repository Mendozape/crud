<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
class SpaController extends Controller
{
    public function index()
    {
        // Get unread notifications and admin status
        $notifications = auth()->user()->unreadNotifications;
        $admin = auth()->user()->isAdmin ? 'Yes' : 'No';

        $data = [
            'notifications' => $notifications,
            'admin' => $admin,
            'user' => auth()->user(),
            'logout_url' => route('logout'),
        ];
        // Inject data into Blade view
        return view('app')->with('data', $data);
    }
}


