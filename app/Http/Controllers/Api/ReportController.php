<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address; 
use App\Models\AddressPayment; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * Debts per Property (Adeudos por Predio)
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
            } elseif ($paymentType) {
                $fee = \App\Models\Fee::where('name', $paymentType)->first();
                if ($fee) {
                    $fees = [$fee];
                }
            }

            // Get all addresses
            $addresses = Address::select('id', 'street', 'street_number', 'type', 'comments')->get();

            $allRows = collect();

            foreach ($fees as $fee) {
                $feeAmount = $fee->amount ?? 0;
                $feeName   = $fee->name ?? '';

                $rows = $addresses->map(function ($address) use ($year, $feeName, $feeAmount) {

                    $fullAddress = "{$address->street} #{$address->street_number} ({$address->type})";

                    // Query all paid months for this address + fee
                    $paymentsQuery = AddressPayment::where('address_id', $address->id)
                        ->where('status', 'Pagado')
                        ->where('year', $year);

                    if ($feeName) {
                        $paymentsQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                    }

                    $paidPayments = $paymentsQuery->get();

                    // Extract paid months
                    $paidMonthsArray = $paidPayments->pluck('month')->toArray();

                    // Historical saved data
                    $paymentDates = [];
                    $paidAmounts  = [];

                    foreach ($paidPayments as $payment) {
                        $paymentDates[$payment->month] = $payment->payment_date;
                        $paidAmounts[$payment->month]  = $payment->amount_paid ?? 0;
                    }

                    // Count paid months
                    $paidMonths = count($paidMonthsArray);

                    // Expected total 12 months
                    $expectedMonths = 12;

                    // Calculate overdue months
                    $months_overdue = max(0, $expectedMonths - $paidMonths);

                    // Debt is always calculated using current fee amount
                    $total = $months_overdue * $feeAmount;

                    // Build monthly dataset (status, date, amount)
                    $monthData = [];

                    for ($m = 1; $m <= 12; $m++) {
                        $isPaid = in_array($m, $paidMonthsArray);

                        $monthData["month_{$m}"] = $isPaid;
                        $monthData["month_{$m}_date"] = $isPaid ? ($paymentDates[$m] ?? null) : null;
                        $monthData["month_{$m}_amount_paid"] = $isPaid ? ($paidAmounts[$m] ?? 0) : null;
                    }

                    return array_merge([
                        'name' => $fullAddress,
                        'full_address' => $fullAddress,
                        'paid_months' => $paidMonths,
                        'fee_amount' => $feeAmount, 
                        'fee_name' => $feeName,
                        'months_overdue' => $months_overdue,
                        'total' => $total,
                        'comments' => $address->comments ?? '',
                    ], $monthData);
                });

                $allRows = $allRows->merge($rows);
            }

            // Sort results
            $allRows = $allRows->values()
                ->sortBy('fee_name')
                ->sortBy('name')
                ->values();

            $grandTotal = $allRows->sum('total');

            return response()->json([
                'success' => true,
                'data' => $allRows,
                'total' => $grandTotal
            ]);
        } catch (\Exception $e) {
            \Log::error('Debtors Report Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal server error while generating debtors report.'
            ], 500);
        }
    }
    /**
     * Get all expenses for the current month and year for the authenticated user.
     */
    public function currentMonthExpenses(Request $request)
    {
        // Get current year and month (or from request if provided, but requirement specifies current month)
        $year = now()->year;
        $month = now()->month;

        // Fetch expenses that fall within the current month/year
        $expenses = Auth::user()->expenses()
            ->whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->get();

        $totalAmount = $expenses->sum('amount');

        // Return the expenses and the calculated total
        return response()->json([
            'message' => 'Gastos del mes recuperados exitosamente.',
            'data' => [
                'expenses' => $expenses,
                'total_amount' => $totalAmount,
                'month_name' => now()->locale('es')->monthName,
                'year' => $year
            ]
        ], 200);
    }
}
