<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource (Index).
     * Fetches all address records, including soft-deleted ones (withTrashed).
     */
    public function index()
    {
        // ENGLISH CODE COMMENTS
        // Use withTrashed() to include soft-deleted records. Eager load the 'resident' relationship.
        $addresses = Address::withTrashed()->with('resident')->get();
        return response()->json(['data' => $addresses]);
    }

    /**
     * Get a list of active addresses for selection in forms.
     */
    public function listActive()
    {
        // ENGLISH CODE COMMENTS
        // Fetches only non-soft-deleted address catalog entries
        $addresses = Address::select('id', 'community', 'street', 'street_number')
            ->whereNull('deleted_at') // Only active addresses
            ->orderBy('community')
            ->get();
            
        // Format the address for display in the frontend select/dropdown
        $formattedAddresses = $addresses->map(function ($address) {
            return [
                'id' => $address->id,
                'full_address' => "Calle {$address->street} #{$address->street_number}, {$address->community}"
            ];
        });

        return response()->json(['data' => $formattedAddresses]);
    }

    /**
     * Store a newly created resource in storage (Create).
     */
    public function store(Request $request)
    {
        // ENGLISH CODE COMMENTS
        // Validation rules.
        $validator = Validator::make($request->all(), [
            'resident_id' => [
                'required',
                'integer',
                'exists:residents,id',
            ],
            
            // Address data validation
            'community' => 'required|string|max:255',
            'street' => 'required|string|max:255',
            'street_number' => [
                'required',
                'string',
                'max:255',
                'numeric', 
                // CRITICAL FIX: The validation check must be robust and ignore soft-deleted records.
                Rule::unique('addresses')->where(function ($query) use ($request) {
                    return $query->where('community', $request->community)
                                 ->where('street', $request->street)
                                 ->where('street_number', $request->street_number)
                                 ->whereNull('deleted_at'); // This makes the validation pass/fail check robust.
                }),
            ],
            'type' => 'required|string|max:255',
            'comments' => 'nullable|string',
        ], [
            // --- CUSTOM ERROR MESSAGES IN SPANISH ---
            // This message will now be used because the validation logic is correct
            'street_number.unique' => 'La combinación de Comunidad, Calle y Número ya existe (Dirección duplicada).',
            'street_number.numeric' => 'El número de calle debe contener solo dígitos.',
            'resident_id.required' => 'Debe seleccionar un residente para asignar la dirección.',
            // ----------------------------------------
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de Validación: ' . $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the new entry. If the validation above passed, the DB insertion *should* succeed.
        try {
            $address = Address::create($request->all());
        } catch (\Illuminate\Database\QueryException $e) {
            // FIX: If, despite the validation, a DB constraint violation occurs (usually unique keys or FKs),
            // we catch it and return our Spanish message.
            if ($e->getCode() === '23000') { // 23000 is the SQLSTATE for Integrity Constraint Violation
                return response()->json([
                    'message' => 'La dirección física ya existe o el residente es inválido.',
                    'errors' => ['general' => 'Violación de restricción de base de datos.']
                ], 422);
            }
            throw $e; // Re-throw other exceptions
        }
        
        return response()->json(['message' => 'Dirección creada exitosamente.', 'data' => $address], 201);
    }

    /**
     * Display the specified resource (Show).
     */
    public function show(Address $address)
    {
        // ENGLISH CODE COMMENTS
        // Returns the data for the specific address record
        return response()->json(['data' => $address]);
    }

    /**
     * Update the specified resource in storage (Edit).
     */
    public function update(Request $request, Address $address)
    {
        // ENGLISH CODE COMMENTS
        // Validation rules.
        $validator = Validator::make($request->all(), [
            'resident_id' => [
                'required',
                'integer',
                'exists:residents,id',
            ],
            'community' => 'required|string|max:255',
            'street' => 'required|string|max:255',
            'street_number' => [
                'required',
                'string',
                'max:255',
                'numeric',
                // FIX: Ignore current ID AND exclude soft-deleted records
                Rule::unique('addresses')->ignore($address->id)->where(function ($query) use ($request) {
                    return $query->where('community', $request->community)
                                 ->where('street', $request->street)
                                 ->where('street_number', $request->street_number)
                                 ->whereNull('deleted_at'); // Key fix for Soft Deletes
                }),
            ],
            'type' => 'required|string|max:255',
            'comments' => 'nullable|string',
        ], [
            // --- CUSTOM ERROR MESSAGES IN SPANISH ---
            'street_number.unique' => 'La combinación de Comunidad, Calle y Número ya existe (Dirección duplicada).',
            'street_number.numeric' => 'El número de calle debe contener solo dígitos.',
            'resident_id.required' => 'Debe seleccionar un residente para asignar la dirección.',
            // ----------------------------------------
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de Validación: ' . $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the entry
        $address->update($request->all());

        return response()->json(['message' => 'Dirección actualizada exitosamente.', 'data' => $address], 200);
    }

    /**
     * Remove the specified resource from storage (Soft Delete/Deactivate).
     */
    public function destroy(Request $request, Address $address)
    {
        // ENGLISH CODE COMMENTS
        // Validation to ensure a reason for deactivation is provided
        $request->validate([
            'reason' => 'required|string|min:5',
        ]);

        // Perform the soft delete (sets the 'deleted_at' timestamp)
        $address->delete();

        return response()->json(['message' => 'Address catalog entry deactivated successfully.'], 200);
    }
}