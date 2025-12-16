<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RolesController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:Ver-roles', ['only' => ['index', 'show']]);
        $this->middleware('permission:Crear-roles', ['only' => ['store']]);
        $this->middleware('permission:Editar-roles', ['only' => ['update']]);
        $this->middleware('permission:Eliminar-roles', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of roles
     */
    public function index()
    {
        try {
            $roles = Role::with('permissions')->get(); // Get all roles with permissions
            return response()->json($roles);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'No se pudieron obtener los roles.', // User message in Spanish
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a specific role
     */
    public function show($id)
    {
        try {
            $role = Role::with('permissions')->findOrFail($id);
            return response()->json($role);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Rol no encontrado.', // User message in Spanish
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created role
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name', // Added unique validation
            'permission' => 'nullable|array', // Allow empty array
        ]);
        try {
            // Create the role with the same guard as your permissions
            $role = Role::create([
                'name' => $request->input('name'),
                'guard_name' => 'web', // <- important fix
            ]);
            
            $permissionIds = $request->input('permission', []);
            
            // Get the actual permission models to ensure compatibility with syncPermissions
            $permissions = Permission::whereIn('id', $permissionIds)->get();
            
            // Sync the permissions
            $role->syncPermissions($permissions);

            // 🚨 CRITICAL FIX: Clear Spatie cache immediately after saving permissions
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            return response()->json([
                'message' => 'Rol creado correctamente.', // User message in Spanish
                'role' => $role
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Fallo al crear el rol.', // User message in Spanish
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Update the specified role
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $id, // Added unique validation
            'permission' => 'nullable|array', // Permission array can be empty if all are removed
        ]);

        try {
            $role = Role::findOrFail($id);
            $role->name = $request->input('name');
            $role->save();

            $permissionIds = $request->input('permission', []); // Get IDs, default to empty array

            // 🚨 THE FIX: Fetch Permission objects based on the IDs sent from the frontend
            $permissions = Permission::whereIn('id', $permissionIds)->get();

            // Use the collection of Permission objects to sync
            $role->syncPermissions($permissions);

            // 🚨 CRITICAL: Clear the permission cache after ANY permission change (Update/Store/Seeder)
            // This is necessary because Laravel AdminLTE is reading a stale cache.
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            return response()->json([
                'message' => 'Rol actualizado correctamente.', // User message in Spanish
                'role' => $role
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Fallo al actualizar el rol.', // User message in Spanish
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified role
     */
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);
            $role->delete();

            // 🚨 CRITICAL: Clear Spatie cache after deletion
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            return response()->json([
                'message' => 'Rol eliminado correctamente.' // User message in Spanish
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Fallo al eliminar el rol.', // User message in Spanish
                'error' => $e->getMessage()
            ], 500);
        }
    }
}