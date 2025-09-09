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
        // Middleware permissions
        $this->middleware('permission:ver-rol|crear-rol|editar-rol|borrar-rol', ['only' => ['index', 'show']]);
        $this->middleware('permission:crear-rol', ['only' => ['store']]);
        $this->middleware('permission:editar-rol', ['only' => ['update']]);
        $this->middleware('permission:borrar-rol', ['only' => ['destroy']]);
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
                'message' => 'Failed to fetch roles.',
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
                'message' => 'Role not found.',
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
            'name' => 'required|string|max:255',
            'permission' => 'required|array',
        ]);

        try {
            $role = Role::create(['name' => $request->input('name')]);
            $role->syncPermissions($request->input('permission'));

            return response()->json([
                'message' => 'Role created successfully.',
                'role' => $role
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create role.',
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
            'name' => 'required|string|max:255',
            'permission' => 'required|array',
        ]);

        try {
            $role = Role::findOrFail($id);
            $role->name = $request->input('name');
            $role->save();
            $role->syncPermissions($request->input('permission'));

            return response()->json([
                'message' => 'Role updated successfully.',
                'role' => $role
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update role.',
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

            return response()->json([
                'message' => 'Role deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete role.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
