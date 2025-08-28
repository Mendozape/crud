<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SpaController extends Controller
{
    /**
     * Handle all SPA routes.
     * Returns the SPA root Blade with minimal data needed for React.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $data = [
            // Pass user info to React
            'user' => $user ? [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'image' => $user->profile_photo_path 
                    ? asset('storage/' . $user->profile_photo_path) 
                    : null,
            ] : null,

            // Notifications (optional)
            'notifications' => $user ? $user->unreadNotifications : collect(),

            // CSRF token for logout form if needed
            'csrfToken' => csrf_token(),
        ];

        // Return SPA root Blade
        return view('app', ['data' => $data]);
    }
}
