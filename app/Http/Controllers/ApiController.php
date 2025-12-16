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
        
        // 🛑 CRITICAL FIX: Explicitly select all columns, including the photo path.
        // This prevents the possibility of the ORM skipping the column during lookup.
        $user = User::select('*')->where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'status' => 0,
                'message' => 'Credenciales inválidas' // Message in Spanish
            ], 401);
        }
        
        // Ensure the User instance is the freshest version from the DB
        $user->fresh(); 

        $token = $user->createToken('example')->plainTextToken;
        
        // 🛑 CRITICAL FIX: Manually serialize the User object
        return response()->json([
            'status' => 1,
            'message' => 'Inicio de sesión exitoso', // Message in Spanish
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                // Force the raw database attribute to be visible
                'profile_photo_path' => $user->getAttributes()['profile_photo_path'] ?? null, 
                // Add any other necessary fields here (e.g., roles, updated_at)
            ]
        ]);
    }
}