<?php

namespace App\Http\Controllers;

use App\Models\ResidentPayment;
use Illuminate\Http\Request;

class ResidentPaymentController extends Controller
{
    public function index()
    {
        $residentPayments = ResidentPayment::all();
        return response()->json($residentPayments);
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
            ->whereIn('month', $validated['months'])
            ->pluck('month')
            ->toArray();

        // Keep only months that are not already saved
        $newMonths = array_diff($validated['months'], $existingMonths);

        // If no new months to save, return an error
        if (empty($newMonths)) {
            return response()->json([
                'message' => 'All selected months are already registered.'
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
            ]);
        }

        return response()->json($payments, 201);
    }

    public function show($id)
    {
        $residentPayment = ResidentPayment::findOrFail($id);
        return response()->json($residentPayment);
    }

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
        $residentPayment->update($validated);

        return response()->json($residentPayment);
    }

    public function destroy($id)
    {
        $residentPayment = ResidentPayment::findOrFail($id);
        $residentPayment->delete();

        return response()->json(['message' => 'Resident payment deleted successfully.'], 200);
    }

    // NEW METHOD: Get paid months for a resident in a specific year
    public function getPaidMonths($residentId, $year, Request $request)
    {
        $feeId = $request->query('fee_id');
        $query = ResidentPayment::where('resident_id', $residentId)
                    ->where('year', $year);
        if ($feeId) {
            $query->where('fee_id', $feeId);
        }
        $months = $query->pluck('month')->unique()->values();
        return response()->json([
            'months' => $months
        ]);
    }
}