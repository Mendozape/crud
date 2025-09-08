<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
class SpaController extends Controller
{
    public function index()
    {
        // Always include the basic user info
        $data = [
            'user' => auth()->user(),
            'logout_url' => route('logout'),
        ];

        // Only include notifications and admin flag if route is /home
        if (request()->is('home')) {
            $data['notifications'] = auth()->user()->unreadNotifications ?? null;
            $data['admin'] = auth()->user()->isAdmin ? 'Yes' : 'No';
        }

        return view('app')->with('data', $data);
    }
}
