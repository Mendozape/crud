<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Street;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule; // <-- Make sure this is imported

class StreetController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:Ver-calles', ['only' => ['index', 'show']]);
        $this->middleware('permission:Crear-calles', ['only' => ['store']]);
        $this->middleware('permission:Editar-calles', ['only' => ['update']]);
        $this->middleware('permission:Eliminar-calles', ['only' => ['destroy']]);
    }
    /**
     * Display a listing of the resource.
     * Includes soft-deleted records to manage 'status' on the frontend table.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Use withTrashed() to fetch all records, including soft-deleted ones, ordered by name.
        $streets = Street::withTrashed()->orderBy('name')->get();
        return response()->json([
            'data' => $streets
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Ensure the name is unique and required.
            'name' => [
                'required',
                'string',
                'max:255',
                // CORRECTION: Only check for uniqueness among records that are NOT soft-deleted.
                // This allows creating a new street if an identical name is currently deactivated.
                Rule::unique('streets', 'name')->where(function ($query) {
                    return $query->whereNull('deleted_at');
                }),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $street = Street::create($request->all());

        return response()->json($street, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Also allow fetching soft-deleted records by ID
        $street = Street::withTrashed()->find($id);

        if (!$street) {
            return response()->json(['message' => 'Street not found'], 404);
        }

        return response()->json($street, 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Fetch the street record, ignoring soft-deleted for update check
        $street = Street::findOrFail($id);

        $validator = Validator::make($request->all(), [
            // Ensure the name is unique, but ignore the current record's name during the uniqueness check
            // For update, we must still only check active records for uniqueness, and ignore the current ID.
            'name' => [
                'required',
                'string',
                'max:255',
                // CORRECTION: Check uniqueness only against ACTIVE records (deleted_at IS NULL) 
                // and ignore the current ID ($street->id).
                Rule::unique('streets')->ignore($street->id)->where(function ($query) {
                    return $query->whereNull('deleted_at');
                }),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $street->update($request->all());

        return response()->json($street, 200);
    }

    /**
     * Soft Delete (Deactivate) the specified resource from storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        // NO validation for 'reason' is needed here, as the user specified the field is not in the DB.

        $street = Street::findOrFail($id);

        // CRITICAL: Check if the street is currently assigned to any address.
        // This prevents soft-deleting a street that is still in use.
        if ($street->addresses()->count() > 0) {
            // User-facing message in Spanish
            return response()->json([
                'message' => 'No se puede desactivar la calle porque está asignada a una o más direcciones.'
            ], 409); // 409 Conflict status
        }

        // Check if already deleted
        if ($street->deleted_at) {
            // User-facing message in Spanish
            return response()->json(['message' => 'La calle ya ha sido dada de baja.'], 409);
        }

        // Perform the soft delete.
        $street->delete();

        // User-facing message in Spanish
        return response()->json(['message' => 'Calle dada de baja exitosamente.'], 200);
    }
}