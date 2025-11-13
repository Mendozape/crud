<?php

namespace App\Http\Controllers;

use App\Models\ResidentPayment;
use App\Models\Resident; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ResidentPaymentController extends Controller
{
    public function index()
    {
        $residentPayments = ResidentPayment::all();
        return response()->json($residentPayments);
    }

    // NEW METHOD: Get Payment History for a specific Resident
    public function paymentHistory($residentId)
    {
        // 1. Check if the resident exists
        try {
            Resident::findOrFail($residentId);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Residente no encontrado.' // Resident not found.
            ], 404);
        }

        // 2. Fetch all payments for History view (Paid and Cancelled)
        $payments = ResidentPayment::where('resident_id', $residentId)
            ->with('fee') // Eager load fee relationship for display
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    // NEW METHOD: Cancel (Anular) a specific payment
    public function cancelPayment($paymentId, Request $request)
    {
        try {
            // Find the payment record
            $payment = ResidentPayment::findOrFail($paymentId);

            // Validate the cancellation reason (required for audit)
            $request->validate([
                'reason' => 'required|string|min:5|max:500',
            ]);

            // Check if the payment is already cancelled
            if ($payment->status !== 'Pagado') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este pago ya ha sido anulado o no está en estado "Pagado".' // Payment already cancelled.
                ], 400);
            }

            // Update the status and audit fields
            $payment->status = 'Cancelado';
            $payment->cancellation_reason = $request->reason;
            $payment->cancelled_at = now();
            $payment->cancelled_by_user_id = Auth::id(); 
            $payment->save();

            return response()->json([
                'success' => true,
                'message' => 'El pago fue anulado exitosamente.' // Payment successfully annulled.
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pago no encontrado.' // Payment not found.
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'El motivo de anulación es requerido.', // Cancellation reason is required.
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo interno al procesar la anulación.' // Internal failure during annulment.
            ], 500);
        }
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'fee_id' => 'required|exists:fees,id',
            'amount' => 'required|numeric',
            'months' => 'required|array|min:1',
            'months.*' => 'integer|between:1,12',
            'year' => 'required|integer',
            'description' => 'nullable|string|max:255',
            'payment_date' => 'required|date',
        ]);

        // Get months that are already registered in the DB
        $existingMonths = ResidentPayment::where('resident_id', $validated['resident_id'])
            ->where('fee_id', $validated['fee_id'])
            ->where('year', $validated['year'])
            // CRITICAL CHECK: Only count months that are 'Pagado' (Paid) as existing.
            ->where('status', 'Pagado') 
            ->whereIn('month', $validated['months'])
            ->pluck('month')
            ->toArray();

        // Keep only months that are not already saved
        $newMonths = array_diff($validated['months'], $existingMonths);

        // If no new months to save, return an error
        if (empty($newMonths)) {
            return response()->json([
                'message' => 'Todos los meses seleccionados ya están registrados como pagados.' // All selected months are already registered as paid.
            ], 422);
        }

        // Register payments only for the new months
        $payments = [];
        foreach ($newMonths as $month) {
            $payments[] = ResidentPayment::create([
                'resident_id' => $validated['resident_id'],
                'fee_id' => $validated['fee_id'],
                'amount' => $validated['amount'],
                'description' => $validated['description'],
                'payment_date' => $validated['payment_date'],
                'month' => $month,
                'year' => $validated['year'],
                'status' => 'Pagado', // Ensure the new payment is saved as 'Pagado'
            ]);
        }

        return response()->json($payments, 201);
    }

    public function show($id)
    {
        $residentPayment = ResidentPayment::findOrFail($id);
        return response()->json($residentPayment);
    }

    // METHOD UPDATE: Added security check to prevent modification of cancelled payments.
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'fee_id' => 'required|exists:fees,id',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
            'payment_date' => 'required|date',
        ]);

        $residentPayment = ResidentPayment::findOrFail($id);

        // SECURITY CHECK: If the payment is cancelled, forbid modification.
        if ($residentPayment->status === 'Cancelado') {
            return response()->json([
                'success' => false,
                'message' => 'No se puede modificar un pago que ya ha sido cancelado.' // Cannot modify a payment that has been cancelled.
            ], 403); // HTTP 403 Forbidden
        }

        $residentPayment->update($validated);

        return response()->json($residentPayment);
    }

    // METHOD DESTROY: Implemented security check to forbid permanent deletion.
    // Deletion must be handled via the 'cancelPayment' method for audit purposes.
    public function destroy($id)
    {
        // Find the record (needed for the error response)
        ResidentPayment::findOrFail($id);
        
        // SECURITY CHECK: Forbid hard delete for transactional integrity.
        return response()->json([
            'success' => false,
            'message' => 'La eliminación física de pagos no está permitida. Por favor, utilice la función "Anular Pago" para revertir la transacción.' // Hard deletion of payments is not allowed. Please use "Annul Payment" function.
        ], 403); // HTTP 403 Forbidden
    }

    // NEW METHOD: Get paid months for a resident in a specific year
    public function getPaidMonths($residentId, $year, Request $request)
    {
        $feeId = $request->query('fee_id');
        $query = ResidentPayment::where('resident_id', $residentId)
            ->where('year', $year)
            ->where('status', 'Pagado'); // CRITICAL: Only count PAID months

        if ($feeId) {
            $query->where('fee_id', $feeId);
        }
        $months = $query->pluck('month')->unique()->values();
        return response()->json([
            'months' => $months
        ]);
    }
}