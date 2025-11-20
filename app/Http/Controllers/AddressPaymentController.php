<?php

namespace App\Http\Controllers;

use App\Models\AddressPayment; // NEW MODEL
use App\Models\Address; // Use Address model instead of Resident
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Fee; 
use App\Models\User; // For audit relationships

class AddressPaymentController extends Controller // NEW CONTROLLER NAME
{
    public function index()
    {
        $addressPayments = AddressPayment::all(); 
        return response()->json($addressPayments);
    }

    /**
     * Get Payment History for a specific Address.
     */
    public function paymentHistory($addressId)
    {
        // 1. Check if the address exists
        try {
            Address::findOrFail($addressId); 
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dirección no encontrada.'
            ], 404);
        }

        // 2. Fetch all payments, eager loading the 'fee' relationship (withTrashed)
        $payments = AddressPayment::where('address_id', $addressId) 
            ->with(['fee' => fn($q) => $q->withTrashed()]) 
            ->orderBy('payment_date', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Cancel (Anular) a specific payment.
     */
    public function cancelPayment($paymentId, Request $request)
    {
        try {
            $payment = AddressPayment::findOrFail($paymentId); // Use new model

            $request->validate([
                'reason' => 'required|string|min:5|max:500',
            ]);

            if ($payment->status !== 'Pagado') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este pago ya ha sido anulado o no está en estado "Pagado".'
                ], 400);
            }

            $payment->status = 'Cancelado';
            $payment->cancellation_reason = $request->reason;
            $payment->cancelled_at = now();
            $payment->cancelled_by_user_id = Auth::id(); 
            $payment->save();

            return response()->json([
                'success' => true,
                'message' => 'El pago fue anulado exitosamente.'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Pago no encontrado.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'El motivo de anulación es requerido.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Fallo interno al procesar la anulación.'], 500);
        }
    }


    /**
     * Store a new payment, linked to an address.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'address_id' => 'required|exists:addresses,id', // CRITICAL CHANGE: Validating against addresses
            'fee_id' => 'required|exists:fees,id',
            'months' => 'required|array|min:1',
            'months.*' => 'integer|between:1,12',
            'year' => 'required|integer',
            'payment_date' => 'required|date',
        ]);

        // Get months that are already registered as paid (status = Pagado)
        $existingMonths = AddressPayment::where('address_id', $validated['address_id']) // CRITICAL CHANGE
            ->where('fee_id', $validated['fee_id'])
            ->where('year', $validated['year'])
            ->where('status', 'Pagado') 
            ->whereIn('month', $validated['months'])
            ->pluck('month')
            ->toArray();

        // Keep only months that are not already saved
        $newMonths = array_diff($validated['months'], $existingMonths);

        // If no new months to save, return an error
        if (empty($newMonths)) {
            return response()->json([
                'message' => 'Todos los meses seleccionados ya están registrados como pagados.'
            ], 422);
        }

        // Register payments only for the new months
        $payments = [];
        foreach ($newMonths as $month) {
            $payments[] = AddressPayment::create([
                'address_id' => $validated['address_id'], // CRITICAL CHANGE
                'fee_id' => $validated['fee_id'],
                'payment_date' => $validated['payment_date'],
                'month' => $month,
                'year' => $validated['year'],
                'status' => 'Pagado',
            ]);
        }

        return response()->json($payments, 201);
    }
    
    // ... (show, update, destroy, getPaidMonths methods need adjustment too)
    
    public function show($id)
    {
        $addressPayment = AddressPayment::findOrFail($id);
        return response()->json($addressPayment);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'address_id' => 'required|exists:addresses,id', // CRITICAL CHANGE
            'fee_id' => 'required|exists:fees,id',
            'payment_date' => 'required|date',
        ]);

        $addressPayment = AddressPayment::findOrFail($id);

        if ($addressPayment->status === 'Cancelado') {
            return response()->json(['success' => false, 'message' => 'No se puede modificar un pago que ya ha sido cancelado.'], 403);
        }

        $updateData = $request->only([
            'address_id',
            'fee_id',
            'payment_date',
        ]);

        $addressPayment->update($updateData);

        return response()->json($addressPayment);
    }

    public function destroy($id)
    {
        AddressPayment::findOrFail($id);
        return response()->json(['success' => false, 'message' => 'La eliminación física de pagos no está permitida. Por favor, utilice la función "Anular Pago" para revertir la transacción.'], 403);
    }

    public function getPaidMonths($addressId, $year, Request $request)
    {
        $feeId = $request->query('fee_id');
        $query = AddressPayment::where('address_id', $addressId) // CRITICAL CHANGE
            ->where('year', $year)
            ->where('status', 'Pagado');

        if ($feeId) {
            $query->where('fee_id', $feeId);
        }
        $months = $query->pluck('month')->unique()->values();
        return response()->json([
            'months' => $months
        ]);
    }
}