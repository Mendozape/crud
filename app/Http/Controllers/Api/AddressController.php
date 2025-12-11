<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException; 

class AddressController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-addresses', ['only' => ['index', 'show', 'listActive']]);
        $this->middleware('permission:create-addresses', ['only' => ['store']]);
        $this->middleware('permission:edit-addresses', ['only' => ['update']]);
        $this->middleware('permission:delete-addresses', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource (Index).
     * Fetches all address records, including soft-deleted ones (withTrashed).
     */
    public function index()
    {
        // ENGLISH CODE COMMENTS
        // Use withTrashed() to include soft-deleted records. Eager load the 'resident' and 'street' relationships.
        $addresses = Address::withTrashed()->with(['resident', 'street'])->get();
        return response()->json(['data' => $addresses]);
    }
    
    /**
     * Get a list of active addresses for selection in forms.
     */
    public function listActive()
    {
        // ENGLISH CODE COMMENTS
        // Fetch only non-soft-deleted address catalog entries
        $addresses = Address::select('id', 'community', 'street_id', 'street_number')
            ->whereNull('deleted_at') // Only active addresses
            ->with('street') // Eager load the street name
            ->orderBy('community')
            ->get();

        // Format the address for display in the frontend select/dropdown
        $formattedAddresses = $addresses->map(function ($address) {
            // Use the relationship to get the street name
            $streetName = $address->street ? $address->street->name : 'N/A';
            return [
                'id' => $address->id,
                'full_address' => "Calle {$streetName} #{$address->street_number}, {$address->community}"
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

            // Validation for street_id
            'street_id' => [
                'required',
                'integer',
                'exists:streets,id', // Must exist in the streets table
            ],

            // Address data validation
            'community' => 'required|string|max:255',
            'street_number' => [
                'required',
                'string',
                'max:255',
                'numeric',
                // Check for uniqueness based on active records
                Rule::unique('addresses')->where(function ($query) use ($request) {
                    return $query->where('community', $request->community)
                        ->where('street_id', $request->street_id)
                        ->where('street_number', $request->street_number)
                        ->whereNull('deleted_at'); // Only check against active addresses
                }),
            ],
            'type' => 'required|string|max:255',
            'comments' => 'nullable|string',
            
            // ⭐ NEW VALIDATION: months_overdue field
            'months_overdue' => 'required|integer|min:0', 
            // ----------------------------------------
        ], [
            // --- CUSTOM ERROR MESSAGES IN SPANISH ---
            'street_number.unique' => 'La combinación de Comunidad, Calle y Número ya existe (Dirección duplicada).',
            'street_number.numeric' => 'El número de calle debe contener solo dígitos.',
            'resident_id.required' => 'Debe seleccionar un residente para asignar la dirección.',
            'street_id.required' => 'Debe seleccionar una calle válida del catálogo.',
            'street_id.exists' => 'La calle seleccionada no existe o no está activa.',
            'months_overdue.required' => 'El número de meses atrasados es obligatorio.',
            'months_overdue.integer' => 'El número de meses atrasados debe ser un número entero.',
            'months_overdue.min' => 'El número de meses atrasados no puede ser negativo.',
            // ----------------------------------------
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de Validación: ' . $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the new entry.
        try {
            // Laravel automatically handles saving street_id and months_overdue
            $address = Address::create($request->all());
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'La dirección física ya existe o el residente es inválido.',
                    'errors' => ['general' => 'Violación de restricción de base de datos.']
                ], 422);
            }
            throw $e;
        }

        return response()->json(['message' => 'Dirección creada exitosamente.', 'data' => $address], 201);
    }

    /**
     * Display the specified resource (Show).
     */
    public function show(Address $address)
    {
        // ENGLISH CODE COMMENTS
        // Returns the data for the specific address record, eager loading street AND resident info.
        return response()->json(['data' => $address->load(['street', 'resident'])]);
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
            // Validation for street_id
            'street_id' => [
                'required',
                'integer',
                'exists:streets,id', // Must exist in the streets table
            ],

            'community' => 'required|string|max:255',
            'street_number' => [
                'required',
                'string',
                'max:255',
                'numeric',
                // Ignore current ID AND exclude soft-deleted records, and use 'street_id'
                Rule::unique('addresses')->ignore($address->id)->where(function ($query) use ($request) {
                    return $query->where('community', $request->community)
                        ->where('street_id', $request->street_id)
                        ->where('street_number', $request->street_number)
                        ->whereNull('deleted_at'); // Key fix for Soft Deletes
                }),
            ],
            'type' => 'required|string|max:255',
            'comments' => 'nullable|string',
            
            // ⭐ NEW VALIDATION: months_overdue field
            'months_overdue' => 'required|integer|min:0', 
            // ----------------------------------------
        ], [
            // --- CUSTOM ERROR MESSAGES IN SPANISH ---
            'street_number.unique' => 'La combinación de Comunidad, Calle y Número ya existe (Dirección duplicada).',
            'street_number.numeric' => 'El número de calle debe contener solo dígitos.',
            'resident_id.required' => 'Debe seleccionar un residente para asignar la dirección.',
            'street_id.required' => 'Debe seleccionar una calle válida del catálogo.',
            'street_id.exists' => 'La calle seleccionada no existe o no está activa.',
            'months_overdue.required' => 'El número de meses atrasados es obligatorio.',
            'months_overdue.integer' => 'El número de meses atrasados debe ser un número entero.',
            'months_overdue.min' => 'El número de meses atrasados no puede ser negativo.',
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

        // 1. Validation to ensure a reason for deactivation is provided
        try {
            $request->validate([
                'reason' => 'required|string|min:5',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'El motivo de baja es obligatorio y debe tener al menos 5 caracteres.'
            ], 422);
        }

        // 2. CRITICAL CHECK: Block deletion only if the address has ACTIVE payments.
        $activePaymentsCount = $address->payments()
            ->whereNull('deleted_at')
            ->count();

        if ($activePaymentsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede dar de baja esta dirección porque tiene pagos registrados ACTIVOS. Anule los pagos o use una nueva dirección.'
            ], 409); // 409 Conflict
        }

        // 3. Perform the soft delete (sets the 'deleted_at' timestamp)
        $address->delete();

        return response()->json(['message' => 'Entrada de catálogo dada de baja exitosamente.'], 200);
    }
}