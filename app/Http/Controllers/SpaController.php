<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Ensure Auth facade is imported

class SpaController extends Controller
{
    /**
     * Loads the Single Page Application (SPA) view and injects user data.
     */
    public function index()
    {
        // Get the authenticated user
        $user = Auth::user();

        // Check if the user is authenticated before attempting to retrieve permissions
        if ($user) {
            // 🚨 CRITICAL CHANGE: Include the user's permissions array 
            // We pluck('name') to get a simple array of strings, which is what React expects.
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                // Add permissions array here
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(), 
                // Optionally include roles' names as well
                'roles' => $user->getRoleNames()->toArray(), 
            ];
        } else {
            // Handle guest scenario
            $userData = null;
        }

        // Prepare the data array for the Blade view
        $data = [
            'user' => $userData,
            'logout_url' => route('logout'),
        ];
        
        // Pass the data to your main Blade view (app.blade.php)
        return view('app')->with('data', $data);
    }
}