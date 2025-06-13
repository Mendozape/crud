<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ApiController extends Controller
{
    public function users(Request $request){
        $users= User::all();
        return response()->json($users);
    }
    
    public function login(Request $request)
    {
        //This API is to generate a token in user table
        // Reed the JSON in the body request
        $data = $request->json()->all(); 
        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid credentials'
            ], 401);
        }
        $token = $user->createToken('example')->plainTextToken;
        return response()->json([
            'status' => 1,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
    }

}
