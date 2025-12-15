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
        // General authentication middleware per permission
        $this->middleware('permission:Ver-usuarios', ['only' => ['index', 'show', 'count']]);
        $this->middleware('permission:Crear-usuarios', ['only' => ['store']]);
        $this->middleware('permission:Editar-usuarios', ['only' => ['update']]);
        $this->middleware('permission:Eliminar-usuarios', ['only' => ['destroy']]);
    }

    // ==========================================================
    // USER CRUD OPERATIONS
    // ==========================================================

    /**
     * GET /api/usuarios
     * Returns a paginated list of users with roles and permissions
     */
    public function index(Request $request)
    {
        try {
            $usuarios = User::with('roles')->paginate(5);

            // Append permissions to each user
            $usuarios->getCollection()->transform(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles, // roles already loaded
                    'permissions' => $user->getAllPermissions(), // permission collection
                ];
            });

            return response()->json($usuarios);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'No se pudieron obtener los usuarios',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/usuarios/{id}
     * Returns a single user with roles and permissions
     */
    public function show($id)
    {
        $user = User::with('roles', 'permissions')->find($id);

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        return response()->json($user);
    }

    /**
     * POST /api/usuarios
     * Creates a new user and assigns roles
     */
    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed',
            'roles' => 'required|min:1'
        ]);

        $input = $request->all();

        // Hash user password
        $input['password'] = Hash::make($input['password']);

        // Create user
        $user = User::create($input);

        // Assign selected roles
        $user->assignRole($request->input('roles'));

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $user
        ], 201);
    }

    /**
     * PUT /api/usuarios/{id}
     * Updates user data and roles
     */
    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $request->validate([
            'name'  => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|confirmed',
            'roles' => 'required|array|min:1',
            'roles.0' => 'required|exists:roles,id',
        ]);

        // Find user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Prepare data for update (excluding password by default)
        $data = $request->only(['name', 'email']);

        // Update password only if provided
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Update user basic information
        $user->update($data);

        // Update roles only if roles exist in the request
        if ($request->has('roles')) {
            DB::table('model_has_roles')
                ->where('model_id', $id)
                ->delete();

            $user->assignRole($request->input('roles'));
        }

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user
        ]);
    }

    /**
     * DELETE /api/usuarios/{id}
     * Deletes a user
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

    // ==========================================================
    // STATS
    // ==========================================================

    /**
     * Returns system statistics
     */
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
