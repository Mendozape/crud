<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; 
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\ResidentPayment; 
use Illuminate\Support\Facades\Auth; // Needed for audit (who deleted it)

class FeeController extends Controller
{
    /**
     * Display a listing of the resource.
     * Fetches ALL fees, including those that are soft-deleted (given de baja).
     */
    public function index()
    {
        // Use withTrashed() to include soft-deleted fees in the list for the UI.
        $fees = Fee::withTrashed()->get();
        //$fees = Fee::all();
        
        return response()->json([
            'success' => true,
            'data' => $fees
        ]);
    }


    public function store(Request $request)
    {
        try {
            // NOTE: Must ensure 'active' status is saved correctly if applicable in the request.
            $input = $request->all();
            $fee = Fee::create($input);
            return response()->json([
                'success' => true,
                'message' => 'Tarifa creada exitosamente', // Fee created successfully
                'data' => $fee
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al crear la tarifa', // Failed to create fee
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * Includes soft-deleted records if found.
     */
    public function show($id)
    {
        // Use withTrashed() to allow viewing details of an inactive fee.
        $fee = Fee::withTrashed()->findOrFail($id); 
        return response()->json($fee);
    }

    /**
     * Update the specified resource in storage.
     * Includes a security check to prevent modification of soft-deleted fees.
     */
    public function update(Request $request, Fee $fee)
    {
        try {
            // SECURITY CHECK: If the fee is logically deleted, forbid updates.
            // Eloquent only finds the record if it's NOT deleted by default. We use the model passed by Route Model Binding.
            if ($fee->deleted_at !== null) {
                 return response()->json([
                    'success' => false,
                    'message' => 'No se puede actualizar una tarifa dada de baja.' // Cannot update a deactivated fee.
                ], 403); 
            }
            
            $request->validate([
                'name' => 'required|string|max:255',
                'amount' => 'required|numeric',
                'description' => 'required|string|max:255',
            ]);
            
            $fee->name = $request->name;
            $fee->amount = $request->amount;
            $fee->description = $request->description;
            $fee->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Tarifa actualizada exitosamente', // Fee updated successfully
                'data' => $fee
            ], 200);
        } catch (ValidationException $e) {
            // Validation errors
            return response()->json([
                'success' => false,
                'message' => 'Error de Validación', // Validation Error
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Other exceptions
            return response()->json([
                'success' => false,
                'message' => 'Fallo al actualizar la tarifa', // Failed to update fee
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Performs a SOFT DELETE (Dar de Baja) on the fee record.
     * Requires 'reason' in the DELETE request body for audit.
     */
    public function destroy($id, Request $request) 
    {
        try {
            // Find the Fee record.
            $fee = Fee::findOrFail($id);
            
            // CHECK 1: Integrity check for associated payments (prevent delete if used in history)
            if ($fee->residentPayments()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede dar de baja la tarifa porque hay pagos de residentes asociados.' // Cannot deactivate fee due to associated payments.
                ], 409); // 409 Conflict
            }

            // CHECK 2: Validate the reason for deactivation (required for audit)
            $request->validate([
                'reason' => 'required|string|min:5|max:255',
            ]);
            
            // 1. Save audit data (reason and user ID) to the fee record
            $fee->deletion_reason = $request->reason;
            $fee->deleted_by_user_id = Auth::id(); // Get the ID of the logged-in user
            $fee->save(); // EXECUTES: UPDATE SQL for audit fields

            // 2. Perform the Soft Delete (sets deleted_at timestamp)
            $fee->delete(); // EXECUTES: UPDATE SQL for deleted_at

            return response()->json(['message' => 'Tarifa dada de baja exitosamente.'], 200); // Fee successfully deactivated.
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Tarifa no encontrada.'], 404); // Fee not found.
        } catch (ValidationException $e) {
            // Handle validation errors from the reason field
            return response()->json(['message' => 'Motivo de baja requerido y debe ser válido.'], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Fallo al dar de baja la tarifa.'], 500); // Failure during deactivation.
        }
    }

    public function redire2()
    {
        return view('fees.index');
    }
}