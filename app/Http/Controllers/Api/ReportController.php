<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address; // Primary Model
use App\Models\AddressPayment; // Transaction Model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Debts per Property (Adeudos por Predio).
     */
    public function debtors(Request $request)
    {
        $paymentType = $request->get('payment_type', null);
        $year = (int) $request->get('year', date('Y'));

        try {
            // Get relevant fees
            $fees = [];
            if ($paymentType === 'Todos') {
                $fees = \App\Models\Fee::all();
            } else if ($paymentType) {
                $fee = \App\Models\Fee::where('name', $paymentType)->first();
                if ($fee) {
                    $fees = [$fee];
                }
            }

            // Fetch all addresses
            $addresses = Address::select('id', 'street', 'street_number', 'type')->get();

            $allRows = collect();

            foreach ($fees as $fee) {
                $feeAmount = $fee->amount ?? 0;
                $feeName = $fee->name ?? '';

                $rows = $addresses->map(function ($address) use ($year, $feeName, $feeAmount) {

                    // Address string is the main identifier
                    $fullAddress = "{$address->street} #{$address->street_number} ({$address->type})";

                    // Get all paid months for this address, fee, and year
                    $paymentsQuery = AddressPayment::where('address_id', $address->id)
                        ->where('status', 'Pagado')
                        ->where('year', $year);

                    if ($feeName) {
                        $paymentsQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                    }

                    $paidPayments = $paymentsQuery->get();

                    // Create array of paid months (1-12) with payment dates
                    $paidMonthsArray = $paidPayments->pluck('month')->toArray();
                    $paymentDates = [];
                    foreach ($paidPayments as $payment) {
                        // Store payment_date keyed by month
                        $paymentDates[$payment->month] = $payment->payment_date; 
                    }

                    // Calculate total paid months
                    $paidMonths = count($paidMonthsArray);

                    // Expected months is 12 (full year)
                    $expectedMonths = 12;

                    $months_overdue = max(0, $expectedMonths - $paidMonths);
                    $total = $months_overdue * $feeAmount;

                    // Create payment status for each month (1=Enero, 2=Febrero, etc.)
                    $monthlyStatus = [];
                    $monthlyDates = [];
                    for ($m = 1; $m <= 12; $m++) {
                        $isPaid = in_array($m, $paidMonthsArray);
                        $monthlyStatus["month_$m"] = $isPaid;
                        $monthlyDates["month_{$m}_date"] = $isPaid ? $paymentDates[$m] : null;
                    }

                    return array_merge([
                        'name' => $fullAddress,
                        'full_address' => $fullAddress,
                        'paid_months' => $paidMonths,
                        'fee_amount' => $feeAmount,
                        'fee_name' => $feeName,
                        'months_overdue' => $months_overdue,
                        'total' => $total,
                    ], $monthlyStatus, $monthlyDates);
                }); // Show ALL addresses (removed filter)

                $allRows = $allRows->merge($rows);
            }

            $allRows = $allRows->values()
                ->sortBy('fee_name')
                ->sortBy('name')
                ->values();

            $grandTotal = $allRows->sum('total');

            return response()->json(['success' => true, 'data' => $allRows, 'total' => $grandTotal]);
        } catch (\Exception $e) {
            \Log::error('Debtors Report Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal server error while generating debtors report.'
            ], 500);
        }
    }
}