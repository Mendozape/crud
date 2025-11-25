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

            // Prevent cancellation if the payment is already cancelled
            if ($payment->status !== 'Pagado') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este pago ya ha sido anulado o no está en estado "Pagado".'
                ], 400);
            }

            // --- CRITICAL FIX: Use the standardized 'delete' audit field names ---
            $payment->status = 'Cancelado';
            $payment->deletion_reason = $request->reason; // FIX: Use deletion_reason
            $payment->deleted_at = now();                // FIX: Use deleted_at
            $payment->deleted_by_user_id = Auth::id();   // FIX: Use deleted_by_user_id
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
            // Log the error for debugging purposes in the server logs
            \Log::error("Payment cancellation failed for ID {$paymentId}: " . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Fallo interno al procesar la anulación.'], 500);
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

        // Save new payments
        $payments = [];
        foreach ($newMonths as $month) {
            $payments[] = AddressPayment::create([
                'address_id'   => $validated['address_id'],
                'fee_id'       => $validated['fee_id'],
                'payment_date' => $validated['payment_date'],
                'month'        => $month,
                'year'         => $validated['year'],
                'status'       => 'Pagado',

                // 🔥 KEY FIELD — stores the fee value at the moment of payment
                'amount_paid'  => $fee->amount,
            ]);
        }

        return response()->json([
            'message'  => 'Payments registered successfully.',
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
            $query->where('fee_id', $feeId);
        }

        // Filter payments that should block re-selection (Paid or Canceled)
        // Payments marked as 'Cancelado' or 'Pagado' occupy the slot.
        $query->whereIn('status', ['Pagado', 'Cancelado']);

        // Exclude soft-deleted payments (allowing re-payment of annulled records)
        $query->whereNull('deleted_at');

        // Get unique month numbers
        $months = $query->pluck('month')->unique()->values();

        return response()->json([
            'months' => $months
        ]);
    }
}
