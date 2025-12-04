<?php

namespace App\Http\Controllers;

use App\Models\AddressPayment;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Fee;
use App\Models\User;

class AddressPaymentController extends Controller
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
            ->withTrashed()
            ->with(['fee' => fn($q) => $q->withTrashed()])
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Cancel (Annul) a specific payment.
     * This performs a logical cancellation by updating the status and audit fields.
     */
    public function cancelPayment($paymentId, Request $request)
    {
        try {
            $payment = AddressPayment::findOrFail($paymentId);

            $request->validate([
                'reason' => 'required|string|min:2|max:500',
            ]);

            // ⭐ CRITICAL FIX 1: Allow cancellation if the status is 'Pagado' OR 'Condonado'.
            if ($payment->deleted_at !== null || !in_array($payment->status, ['Pagado', 'Condonado'])) {
                // Check if already soft deleted or not a revocable status
                return response()->json([
                    'success' => false,
                    'message' => 'Este movimiento ya ha sido anulado o no es un estado que pueda ser revertido ("Pagado" o "Condonado").'
                ], 400);
            }

            // --- CRITICAL FIX 2: Use Eloquent's delete() method for Soft Deletes ---
            // This ensures all SoftDelete mechanisms are triggered.

            // 1. Update status and audit fields manually *before* calling delete() if needed for display
            $payment->status = 'Cancelado';
            $payment->deletion_reason = $request->reason;
            $payment->deleted_by_user_id = Auth::id();
            $payment->save(); 
            
            // 2. Perform the Soft Delete. This sets the definitive 'deleted_at' timestamp.
            $payment->delete(); 
            // Note: Since SoftDeletes is used, the 'deleted_at' will be set again by $payment->delete().

            return response()->json([
                'success' => true,
                'message' => 'El movimiento fue anulado exitosamente.'
            ], 200);
        } catch (ModelNotFoundException $e) {
            // ... (catch blocks) ...
        } catch (ValidationException $e) {
            // ... (catch blocks) ...
        } catch (\Exception $e) {
            // ... (catch blocks) ...
        }
    }


    /**
     * Store a new payment, linked to an address.
     */
    public function store(Request $request)
    {
        // --- VALIDATION ---
        $validated = $request->validate([
            'address_id'    => 'required|exists:addresses,id',
            'fee_id'        => 'required|exists:fees,id',
            'payment_date'  => 'required|date',
            'year'          => 'required|digits:4',
            'months'        => 'required|array',
            'months.*'      => 'integer|min:1|max:12',

            // NEW VALIDATION: Waived months (optional array)
            'waived_months' => 'nullable|array',
            'waived_months.*' => 'integer|min:1|max:12',
        ]);

        // Load the fee to store the historical amount
        $fee = Fee::findOrFail($validated['fee_id']);

        // Fetch existing payments for this address, fee, and year
        $existingPayments = AddressPayment::where('address_id', $validated['address_id'])
            ->where('fee_id', $validated['fee_id'])
            ->where('year', $validated['year'])
            ->whereIn('month', $validated['months'])
            ->pluck('month')
            ->toArray();

        // Determine which months still need to be registered
        $newMonths = array_diff($validated['months'], $existingPayments);

        if (empty($newMonths)) {
            return response()->json([
                'message' => 'These months are already registered.',
                'registered' => [],
            ], 200);
        }

        // NEW: Get the list of months to be waived (defaults to empty array)
        $monthsToWaive = $validated['waived_months'] ?? [];


        // Save new payments/condonations
        $payments = [];
        foreach ($newMonths as $month) {

            // Determine if the current month is in the waived list
            $isWaived = in_array($month, $monthsToWaive);

            // Set amount to 0 if the month is waived, otherwise use the full fee amount
            $amountToPay = $isWaived ? 0 : $fee->amount;

            // Set status to 'Condonado' if waived, otherwise 'Pagado'
            $status = $isWaived ? 'Condonado' : 'Pagado';

            $payments[] = AddressPayment::create([
                'address_id'   => $validated['address_id'],
                'fee_id'       => $validated['fee_id'],
                'payment_date' => $validated['payment_date'],
                'month'        => $month,
                'year'         => $validated['year'],

                // 🔥 UPDATED FIELDS
                'status'       => $status,
                'amount_paid'  => $amountToPay,
            ]);
        }

        return response()->json([
            'message'  => 'Movements (Payments and/or Waived) registered successfully.',
            'saved'    => $payments,
            'skipped'  => array_values($existingPayments),
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $addressPayment = AddressPayment::findOrFail($id);
        return response()->json($addressPayment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'address_id' => 'required|exists:addresses,id',
            'fee_id' => 'required|exists:fees,id',
            'payment_date' => 'required|date',
        ]);

        $addressPayment = AddressPayment::findOrFail($id);

        // Prevent modification if the payment is cancelled/annulled
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

    /**
     * Prevents physical deletion, enforcing logical annulment instead.
     */
    public function destroy($id)
    {
        AddressPayment::findOrFail($id);
        return response()->json(['success' => false, 'message' => 'La eliminación física de pagos no está permitida. Por favor, utilice la función "Anular Pago" para revertir la transacción.'], 403);
    }

    /**
     * Get the months that are already paid for a given address, fee, and year.
     */
    public function getPaidMonths($addressId, $year, Request $request)
    {
        $feeId = $request->query('fee_id');

        // Base query: filter by address and year
        $query = AddressPayment::where('address_id', $addressId)
            ->where('year', $year);

        if ($feeId) {
            // Filter by fee type if provided
            $query->where('fee_id', $feeId);
        }

        // Only return payments that block re-selection
        // Payments marked as 'Pagado', 'Cancelado', or 'Condonado' occupy that month
        $query->whereIn('status', ['Pagado', 'Cancelado', 'Condonado']);

        // Exclude soft-deleted payments (those annulled can be re-paid)
        $query->whereNull('deleted_at');

        // Get month + status and ensure only one record per month
        $months = $query->get(['month', 'status'])
            ->unique('month')   // Ensure only one record per month
            ->values();         // Reindex the collection

        return response()->json([
            'months' => $months
        ]);
    }
}
