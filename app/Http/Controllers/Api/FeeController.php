<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; // Import ValidationException
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\ResidentPayment; // Make sure to import the ResidentPayment model

class FeeController extends Controller
{
    public function index()
    {
        $fees = Fee::all();
        return response()->json([
            'success' => true,
            'data' => $fees
        ]);
    }


    public function store(Request $request)
    {
        try {
            $input = $request->all();
            $resident = Fee::create($input);
            return response()->json([
                'success' => true,
                'message' => 'Tarifa creada exitosamente', // Fee created successfully
                'data' => $resident
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al crear la tarifa', // Failed to create fee
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $fee = Fee::findOrFail($id);
        return response()->json($fee);
    }

    public function update(Request $request, Fee $fee)
    {
        try {
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

    public function destroy($id)
    {
        // Start error handling block
        try {
            // Find the Fee record by ID.
            $fee = Fee::findOrFail($id);
            
            // CRITICAL CHECK: Check if there are any associated payments (using the model relationship)
            if ($fee->residentPayments()->count() > 0) {
                // If associated payments exist, prevent deletion and return a 409 Conflict.
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la tarifa porque hay pagos de residentes asociados.' // Cannot delete fee because there are associated resident payments.
                ], 409); // 409 Conflict is the most appropriate HTTP status here.
            }

            // Proceed to delete the Fee record (since no payments reference it)
            $fee->delete();

            // Return a successful deletion response
            return response()->json(['message' => 'Tarifa eliminada exitosamente.'], 200); // Fee deleted successfully.
        } catch (ModelNotFoundException $e) {
            // Handle case where the Fee ID was not found (404 Not Found)
            return response()->json(['message' => 'Tarifa no encontrada.'], 404); // Fee not found.
        } catch (\Exception $e) {
            // Handle any unexpected server error during deletion (500 Internal Server Error)
            return response()->json(['message' => 'Fallo al eliminar la tarifa.'], 500); // Failed to delete fee.
        }
    }

    public function redire2()
    {
        return view('fees.index');
    }
}