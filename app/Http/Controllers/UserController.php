<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:Ver-usuarios', ['only' => ['index', 'show', 'count']]);
        $this->middleware('permission:Crear-usuarios', ['only' => ['store']]);
        $this->middleware('permission:Editar-usuarios', ['only' => ['update', 'restore']]); // Restore added
        $this->middleware('permission:Eliminar-usuarios', ['only' => ['destroy']]);
    }

    public function index(Request $request)
    {
        try {
            $query = User::withTrashed()->with(['roles', 'address']);

            if ($request->has('search')) {
                $search = $request->query('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            $perPage = $request->has('search') ? 50 : 10;
            $usuarios = $query->paginate($perPage);

            $usuarios->getCollection()->transform(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'comments' => $user->comments,
                    'roles' => $user->roles,
                    'permissions' => $user->getAllPermissions(),
                    'address' => $user->address,
                    'deleted_at' => $user->deleted_at,
                ];
            });

            return response()->json($usuarios);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::withTrashed()->with(['roles', 'address'])->findOrFail($id);
            $user->all_permissions = $user->getAllPermissions();
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:6',
            'roles' => 'required|array|min:1',
        ]);

        $input = $request->all();
        $input['email'] = strtolower($input['email']);
        $input['password'] = Hash::make($input['password']);

        $user = User::create($input);
        $user->assignRole($request->input('roles'));

        return response()->json(['message' => 'Usuario creado correctamente', 'user' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'  => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id,
            'roles' => 'required|array|min:1',
        ]);

        $user = User::withTrashed()->findOrFail($id);
        $data = $request->only(['name', 'email', 'phone', 'comments']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($request->has('roles')) {
            $user->syncRoles($request->input('roles'));
        }

        return response()->json(['message' => 'Usuario actualizado', 'user' => $user]);
    }

    /**
     * 🟢 NEW METHOD: Restore a soft-deleted user
     */
    public function restore($id)
    {
        try {
            // Essential to use withTrashed() to find a record that is currently "deleted"
            $user = User::withTrashed()->findOrFail($id);
            $user->restore();

            return response()->json(['message' => 'Usuario reactivado correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo reactivar al usuario: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            if ($user->address) {
                return response()->json(['error' => 'El usuario tiene un predio asignado.'], 400);
            }
            $user->delete();
            return response()->json(['message' => 'Usuario desactivado']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar'], 500);
        }
    }

    public function count()
    {
        return response()->json([
            'userCount' => User::count(),
            'roleCount' => Role::count(),
            //'residentCount' => User::role('Residente')->count(),
        ]);
    }
}
