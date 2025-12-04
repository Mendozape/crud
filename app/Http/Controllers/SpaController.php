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
        return view('app')->with('data', $data);
    }
}
