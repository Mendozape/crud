<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
class SpaController extends Controller
{
    public function index()
    {
        $data = null;

        // Only load stats if the route is /home
        if (request()->is('home')) {
            $data = [
                'stats' => [
                    'usersCount' => User::count(),
                    'paymentsCount' => Payment::count(),
                    // other data needed for home page
                ]
            ];
        }

        // Pass data to app.blade.php. If not home, $data will be null
        return view('app', compact('data'));
    }

}


