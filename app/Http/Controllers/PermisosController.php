<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Log; // For better error logging

class PermisosController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:Ver-permisos', ['only' => ['index', 'show']]);
        $this->middleware('permission:Crear-permisos', ['only' => ['store']]);
        $this->middleware('permission:Editar-permisos', ['only' => ['update']]);
        $this->middleware('permission:Eliminar-permisos', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permisos = Permission::all(); // Fetches all permissions
        return response()->json($permisos);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $permiso = Permission::find($id);

        if (!$permiso) {
            return response()->json(['message' => 'Permiso no encontrado'], 404); // User message in Spanish
        }

        return response()->json($permiso);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name', // Added unique validation
        ]);

        try {
            // Create the permission
            $permiso = Permission::create([
                'name' => $request->input('name'),
                'guard_name' => 'web',
            ]);

            // 🚨 CRITICAL FIX: Clear Spatie cache immediately after creating the permission
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            // Return success response
            return response()->json([
                'message' => 'Permiso creado correctamente.', // User message in Spanish
                'permiso' => $permiso
            ], 201);

        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error('Error creating permission: ' . $e->getMessage());

            // Return an error response
            return response()->json([
                'message' => 'Fallo al crear el permiso.', // User message in Spanish
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $id, // Added unique validation
        ]);
        
        try {
            $permiso = Permission::findOrFail($id);
            $permiso->update(['name' => $request->input('name')]);

            // 🚨 CRITICAL FIX: Clear Spatie cache immediately after updating the permission
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            return response()->json([
                'message' => 'El permiso ha sido actualizado con éxito.', // User message in Spanish
                'permiso' => $permiso
            ]);
        } catch (\Exception $e) {
             Log::error('Error updating permission: ' . $e->getMessage());
             return response()->json([
                'message' => 'Fallo al actualizar el permiso.', // User message in Spanish
                'error' => $e->getMessage()
             ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            Permission::destroy($id);
            
            // 🚨 CRITICAL FIX: Clear Spatie cache immediately after deleting the permission
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            
            return response()->json(['message' => 'El permiso ha sido eliminado con éxito.']); // User message in Spanish
        } catch (\Exception $e) {
             Log::error('Error deleting permission: ' . $e->getMessage());
             return response()->json([
                'message' => 'Fallo al eliminar el permiso.', // User message in Spanish
                'error' => $e->getMessage()
             ], 500);
        }
    }
}