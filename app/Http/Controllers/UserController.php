<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ImportUser;
use App\Exports\ExportUser;
use App\Models\User;
use App\Models\Resident;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\DataBase;
use App\Events\UserRegistered;

class UserController extends Controller
{
    public function __construct()
    {
        // General Authentication (Applies to all methods if no specific permission is set)
        $this->middleware('auth');
        
        // CRUD Permissions (From UsuariosController)
        $this->middleware('permission:ver-usuario|crear-usuario|editar-usuario|borrar-usuario', ['only' => ['index', 'show']]);
        $this->middleware('permission:crear-usuario', ['only' => ['store']]);
        $this->middleware('permission:editar-usuario', ['only' => ['update']]);
        $this->middleware('permission:borrar-usuario', ['only' => ['destroy']]);
    }

    // ====================================================================
    // 1. STATS, NOTIFICATIONS & EXCEL METHODS (From original UserController)
    // ====================================================================

    public function count()
    {
        $userCount = User::count();
        $residentCount = Resident::count(); // Renamed from clientCount to residentCount for clarity
        $roleCount = Role::count();
        return response()->json([
            'userCount' => $userCount,
            'residentCount' => $residentCount,
            'roleCount' => $roleCount,
        ]);
    }

    public function countNotis()
    {
        $countNotis = auth()->user()->unreadNotifications;
        return response()->json([
            'countNotis' => $countNotis
        ]);
    }

    public function notis ($id) 
    {
        $noti = auth()->user()->unreadNotifications->where('id',$id);
        return response()->json(['noti' => $noti]);
    }

    public function importView(Request $request)
    {
        return view('excel.importFile');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file |mimes:xlsx,csv|max:2048'
        ]);
        Excel::import(new ImportUser, $request->file('file')->store('files'));
        return redirect()->back()->with('users_added','The users have been added');
    }

    public function exportUsers(Request $request)
    {
        return Excel::download(new ExportUser, 'users.xlsx');
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

        $admins = User::role('Admin')->get();
        Notification::send($admins, new DataBase($user)); // Notify all admins

        event(new UserRegistered($user->name)); // Fire registered event

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
}