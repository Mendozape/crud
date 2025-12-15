<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; 
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\AddressPayment; // Correct Model: AddressPayment
use Illuminate\Support\Facades\Auth; // Needed for audit (who deleted it)

class FeeController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:Ver-cuotas', ['only' => ['index', 'show']]);
        $this->middleware('permission:Crear-cuotas', ['only' => ['store']]);
        $this->middleware('permission:Editar-cuotas', ['only' => ['update']]);
        $this->middleware('permission:Eliminar-cuotas', ['only' => ['destroy']]);
    }
    /**
     * Display a listing of the resource.
     * Fetches ALL fees, including those that are soft-deleted (deactivated).
     */
    public function index()
    {
        // Use withTrashed() to include soft-deleted fees in the list for the UI.
        $fees = Fee::withTrashed()->get();
        
        return response()->json([
            'success' => true,
            'data' => $fees
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // NOTE: Validation logic omitted for brevity but should be included here.
            $input = $request->all();
            $fee = Fee::create($input);
            
            return response()->json([
                'success' => true,
                'message' => 'Tarifa creada exitosamente',
                'data' => $fee
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al crear la tarifa',
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
            if ($fee->deleted_at !== null) {
                 return response()->json([
                     'success' => false,
                     'message' => 'No se puede actualizar una tarifa dada de baja.' 
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
                'message' => 'Tarifa actualizada exitosamente', 
                'data' => $fee
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de Validación', 
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al actualizar la tarifa', 
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
            $fee = Fee::findOrFail($id);
            
            // CHECK 1: Integrity Check - Uses the corrected addressPayments() relationship
            if ($fee->addressPayments()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede dar de baja la tarifa porque hay pagos de predios asociados.'
                ], 409); // 409 Conflict
            }

            // CHECK 2: Validate the required reason for deactivation (audit trail)
            $request->validate([
                'reason' => 'required|string|min:1|max:255',
            ]);
            
            // 1. Save audit data before soft delete
            $fee->deletion_reason = $request->reason;
            $fee->deleted_by_user_id = Auth::id(); // Get the ID of the logged-in user
            $fee->save(); 

            // 2. Perform the Soft Delete (sets deleted_at)
            $fee->delete(); 

            return response()->json(['message' => 'Tarifa dada de baja exitosamente.'], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Tarifa no encontrada.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Motivo de baja requerido y debe ser válido.'], 422);
        } catch (\Exception $e) {
            // Generic 500 error message (debug message removed)
            return response()->json(['message' => 'Fallo al dar de baja la tarifa.'], 500);
        }
    }

    public function redire2()
    {
        return view('fees.index');
    }
}