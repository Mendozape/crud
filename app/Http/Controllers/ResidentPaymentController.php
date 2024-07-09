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
            'description' => 'nullable|string',
            'payment_date' => 'required|date',
        ]);

        $residentPayment = ResidentPayment::create($validated);
        return response()->json($residentPayment, 201);
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
}
