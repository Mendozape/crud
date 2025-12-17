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
        $user = Auth::user();

        if ($user) {
            // Eager load permissions and roles to avoid issues
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                // Accessing raw attribute to avoid accessor conflicts
                'profile_photo_path' => $user->getAttributes()['profile_photo_path'] ?? null,
                // Use getAllPermissions to get direct and inherited permissions (via roles)
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(), 
                'roles' => $user->getRoleNames()->toArray(), 
            ];
        } else {
            $userData = null;
        }

        $data = [
            'user' => $userData,
            'logout_url' => route('logout'),
        ];
        
        // Ensure app.blade.php does: window.Laravel = {!! json_encode($data) !!};
        return view('app')->with('data', $data);
    }
}