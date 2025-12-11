<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Resident;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function __construct()
    {
        // General Authentication (Applies to all methods if no specific permission is set)
        $this->middleware('permission:view-users', ['only' => ['index', 'show']]);
        $this->middleware('permission:create-users', ['only' => ['store']]);
        $this->middleware('permission:edit-users', ['only' => ['update']]);
        $this->middleware('permission:delete-users', ['only' => ['destroy']]);
        $this->middleware('permission:stats', ['only' => ['count']]);
    }
    // ====================================================================
    // 2. USER CRUD OPERATIONS (From UsuariosController)
    // ====================================================================
    
    /**
     * GET /api/usuarios - Returns a paginated list of users with roles and permissions.
     */
    public function index(Request $request)
    {
        try {
            $usuarios = User::with('roles')->paginate(5);

            // Add permissions to each user
            $usuarios->getCollection()->transform(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles, // already loaded
                    'permissions' => $user->getAllPermissions(), // collection of Permission objects
                ];
            });

            return response()->json($usuarios);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Unable to fetch users',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/usuarios/{id} - Returns a single user with roles and permissions.
     */
    public function show($id)
    {
        $user = User::with('roles', 'permissions')->find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    /**
     * POST /api/usuarios - Creates a new user, assigns roles, and sends notification.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed',
            'roles' => 'required|min:1'
        ]);

        $input = $request->all();
        $input['password'] = Hash::make($input['password']); // Hash the password
        $user = User::create($input);
        $user->assignRole($request->input('roles')); // Assign selected roles

        //$admins = User::role('Admin')->get();
        //Notification::send($admins, new DataBase($user)); // Notify all admins
        //event(new UserRegistered($user->name)); // Fire registered event

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * PUT /api/usuarios/{id} - Updates user info and roles.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name'=>'required',
            'email'=>'required|email|unique:users,email,'.$id,
            'password'=>'nullable|same:password_confirmation', // Assuming frontend sends 'password_confirmation' or nothing
            'roles'=>'required|min:1'
        ]);

        $input = $request->all();
        
        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']); // Hash if password provided
        } else {
            // Keep existing password if input is empty
            $input = Arr::except($input, ['password', 'password_confirmation']); 
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->update($input);
        DB::table('model_has_roles')->where('model_id', $id)->delete(); // Remove old roles
        $user->assignRole($request->input('roles')); // Assign new roles

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * DELETE /api/usuarios/{id} - Deletes the user.
     */
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        $user->delete();
        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
    // ====================================================================
    // 1. STATS, NOTIFICATIONS & EXCEL METHODS (From original UserController)
    // ====================================================================
    public function count()
    {
        $userCount = User::count();
        $residentCount = Resident::count(); 
        $roleCount = Role::count();
        return response()->json([
            'userCount' => $userCount,
            'residentCount' => $residentCount,
            'roleCount' => $roleCount,
        ]);
    }
}