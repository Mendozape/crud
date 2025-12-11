<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermisosController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-permissions', ['only' => ['index', 'show']]);
        $this->middleware('permission:create-permissions', ['only' => ['store']]);
        $this->middleware('permission:edit-permissions', ['only' => ['update']]);
        $this->middleware('permission:delete-permissions', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permisos = Permission::all(); // trae todos los permisos
        return response()->json($permisos);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $permiso = Permission::find($id);

        if (!$permiso) {
            return response()->json(['message' => 'Permiso no encontrado'], 404);
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
        'name' => 'required|string|max:255',
    ]);

    try {
        // Create the permission
        $permiso = Permission::create([
            'name' => $request->input('name'),
            'guard_name' => 'web',
        ]);

        // Return success response
        return response()->json([
            'message' => 'Permission created successfully.',
            'permiso' => $permiso
        ], 201);

    } catch (\Exception $e) {
        // Log the exception for debugging
        \Log::error('Error creating permission: ' . $e->getMessage());

        // Return an error response
        return response()->json([
            'message' => 'Failed to create permission.',
            'error' => $e->getMessage()
        ], 500);
    }
}


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required']);
        $permiso = Permission::findOrFail($id);
        $permiso->update(['name' => $request->input('name')]);

        return response()->json([
            'message' => 'El permiso ha sido actualizado con éxito',
            'permiso' => $permiso
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Permission::destroy($id);
        return response()->json(['message' => 'El permiso ha sido eliminado con éxito']);
    }
}
