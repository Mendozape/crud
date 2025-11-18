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
     * Fetches all address catalog entries, including soft-deleted ones (withTrashed).
     */
    public function index()
    {
        // ENGLISH CODE COMMENTS
        // Use withTrashed() to include soft-deleted records (required for the CRUD table status display)
        $addresses = Address::withTrashed()->get();
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
                'full_address' => "{$address->community}, Calle {$address->street} #{$address->street_number}"
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
        // Validation rules. The combination of the three key fields must be unique.
        $validator = Validator::make($request->all(), [
            'community' => 'required|string|max:255',
            'street' => 'required|string|max:255',
            'street_number' => [
                'required',
                'string',
                'max:255',
                'numeric', // Added numeric validation consistent with frontend
                // Unique check against the combination of the three key fields
                Rule::unique('addresses')->where(function ($query) use ($request) {
                    return $query->where('community', $request->community)
                                 ->where('street', $request->street);
                }),
            ],
            'type' => 'required|string|max:255', // CHANGED TO REQUIRED
            'comments' => 'nullable|string',
        ], [
            // Custom message for the unique constraint violation
            'street_number.unique' => 'A catalog entry with the exact Community, Street, and Number already exists.',
            'street_number.numeric' => 'The street number must contain only numbers.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the new catalog entry
        $address = Address::create($request->all());
        
        return response()->json(['message' => 'Address catalog entry created successfully.', 'data' => $address], 201);
    }

    /**
     * Display the specified resource (Show).
     * Used typically to fetch data before the Edit form loads.
     */
    public function show(Address $address)
    {
        // ENGLISH CODE COMMENTS
        // Returns the data for the specific catalog entry
        return response()->json(['data' => $address]);
    }

    /**
     * Update the specified resource in storage (Edit).
     */
    public function update(Request $request, Address $address)
    {
        // ENGLISH CODE COMMENTS
        // Validation rules. The combination of the three fields must be unique,
        // but ignoring the current address record ID during the unique check.
        $validator = Validator::make($request->all(), [
            'community' => 'required|string|max:255',
            'street' => 'required|string|max:255',
            'street_number' => [
                'required',
                'string',
                'max:255',
                'numeric', // Added numeric validation consistent with frontend
                // Unique check, ignoring the current record ID ($address->id)
                Rule::unique('addresses')->ignore($address->id)->where(function ($query) use ($request) {
                    return $query->where('community', $request->community)
                                 ->where('street', $request->street);
                }),
            ],
            'type' => 'required|string|max:255', // CHANGED TO REQUIRED
            'comments' => 'nullable|string',
        ], [
            'street_number.unique' => 'A catalog entry with the exact Community, Street, and Number already exists.',
            'street_number.numeric' => 'The street number must contain only numbers.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the catalog entry
        $address->update($request->all());
        
        return response()->json(['message' => 'Address catalog entry updated successfully.', 'data' => $address], 200);
    }

    /**
     * Remove the specified resource from storage (Soft Delete/Deactivate).
     */
    public function destroy(Request $request, Address $address)
    {
        // ENGLISH CODE COMMENTS
        // Validation to ensure a reason for deactivation is provided, matching the frontend logic
        $request->validate([
            'reason' => 'required|string|min:5',
        ]);

        // Perform the soft delete (sets the 'deleted_at' timestamp)
        $address->delete();
        
        return response()->json(['message' => 'Address catalog entry deactivated successfully.'], 200);
    }
}