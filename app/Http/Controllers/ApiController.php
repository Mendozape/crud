<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ApiController extends Controller
{
    public function users(Request $request){
        $users= User::all();
        //return response($users)
        return response()->json($users);
        /*->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Credentials', 'false')
        ->header('Access-Control-Allow-Methods', 'GET')
        ->header('Content-Type', 'application/json')
        ->header('Access-Control-Allow-Headers', '*');*/
        //return response()->json()->header('Content-Type', 'fdsfsf');
        //$headers= $request->header();
        //return response()->json($headers);
    }
    public function login(Request $request){
        $response = ["status"=>0, "msgx"=>""];
        $data=json_decode($request->getContent());
        $user=User::where('email',$data->email)->first();
        if($user){
            if(Hash::check($data->password,$user->password)){
                $token=$user->createToken("example");
                $response["status"] = 1;
                $response["msgx"] =$token->plainTextToken;
            }else{
                $response = ["msgx"=>"Incorrect Credentials"];
            }
        }else{
            $response = ["msgx"=>"User didn find"];
        }
        return response()->json($response);
    }
}
