<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ApiController extends Controller
{
    public function users(Request $request){
        // Fetch all users
        $users= User::all();
        return response()->json($users);
    }
    
    public function login(Request $request)
    {
        // Read the JSON in the body request
        $data = $request->json()->all(); 
        
        // CRITICAL FIX: Explicitly select all columns, including the photo path.
        $user = User::select('*')->where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'status' => 0,
                'message' => 'Credenciales inválidas'
            ], 401);
        }
        
        // Ensure the User instance is the freshest version from the DB
        $user->fresh(); 

        $token = $user->createToken('example')->plainTextToken;
        
        // 🛑 CRITICAL FIX: Added permissions and roles to the response
        // This ensures the React state has the required data for the 'can' hook immediately.
        return response()->json([
            'status' => 1,
            'message' => 'Inicio de sesión exitoso',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                // Force the raw database attribute to be visible
                'profile_photo_path' => $user->getAttributes()['profile_photo_path'] ?? null,
                // 🛡️ PERMISSIONS & ROLES: Needed for the frontend 'can' hook
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'roles' => $user->getRoleNames()->toArray(),
            ]
        ]);
    }
}